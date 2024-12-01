import tensorflow as tf
import numpy as np
import sys
import json
from transformers import BertTokenizer

# Fungsi untuk memuat model TensorFlow Lite
def load_model(model_path):
    interpreter = tf.lite.Interpreter(model_path=model_path)
    interpreter.allocate_tensors()
    return interpreter

# Fungsi untuk mempersiapkan data (preprocessing)
def prepare_data(input_text, tokenizer):
    token = tokenizer.encode_plus(
        input_text,
        max_length=256,
        truncation=True,
        padding='max_length',
        add_special_tokens=True,
        return_tensors='tf'
    )
    return {
        'input_ids': tf.cast(token.input_ids, tf.int32),
        'attention_mask': tf.cast(token.attention_mask, tf.int32)
    }

# Fungsi untuk membuat prediksi
def make_prediction(model, processed_data, classes=['Awful', 'Poor', 'Neutral', 'Good', 'Awesome']):
    input_ids = processed_data['input_ids']
    attention_mask = processed_data['attention_mask']
    
    # Menyiapkan input untuk model (gunakan tensor)
    input_data = np.array(input_ids, dtype=np.int32)
    attention_data = np.array(attention_mask, dtype=np.int32)

    # Tentukan input tensor
    input_details = model.get_input_details()
    output_details = model.get_output_details()

    # Set input data untuk model
    model.set_tensor(input_details[0]['index'], input_data)
    model.set_tensor(input_details[1]['index'], attention_data)

    # Menjalankan model
    model.invoke()

    # Mendapatkan hasil prediksi
    output_data = model.get_tensor(output_details[0]['index'])
    
    # Mencari kelas dengan probabilitas tertinggi
    predicted_class = np.argmax(output_data)

    # Mengembalikan hasil prediksi
    return classes[predicted_class]

# Menangani input dan menjalankan prediksi
if __name__ == "__main__":
    # Memuat model dan tokenizer
    model_path = './models/bert_sentiment_model.tflite'
    model = load_model(model_path)
    
    # Memuat tokenizer
    tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')

    # Input teks untuk prediksi
    input_text = sys.argv[1]  # Dapatkan input dari argumen baris perintah
    processed_data = prepare_data(input_text, tokenizer)
    
    # Prediksi menggunakan model
    result = make_prediction(model, processed_data)
    
    # Menampilkan hasil prediksi
    print(f"Predicted Sentiment: {result}")
