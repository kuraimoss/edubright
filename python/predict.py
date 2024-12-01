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
        'input_ids': tf.cast(token.input_ids, tf.int32),  # Pastikan 'input_ids' adalah INT32
        'attention_mask': tf.cast(token.attention_mask, tf.int32)  # Pastikan 'attention_mask' adalah INT32
    }

# Fungsi untuk membuat prediksi
def make_prediction(model, processed_data, classes=['Awful', 'Poor', 'Neutral', 'Good', 'Awesome']):
    # Menyiapkan tensor input untuk model
    input_ids = processed_data['input_ids']
    attention_mask = processed_data['attention_mask']
    
    # Menyiapkan input ke model
    input_details = model.get_input_details()
    output_details = model.get_output_details()

    model.set_tensor(input_details[0]['index'], input_ids.numpy())
    model.set_tensor(input_details[1]['index'], attention_mask.numpy())
    model.invoke()
    
    # Mendapatkan hasil prediksi (output tensor)
    output_data = model.get_tensor(output_details[0]['index'])
    
    # Misalnya output model adalah skor untuk setiap kelas
    predicted_class_index = np.argmax(output_data)  # Ambil indeks dengan skor tertinggi
    predicted_class = classes[predicted_class_index]  # Pemetaan ke label
    
    return predicted_class

# Fungsi utama
def main():
    model_path = "./models/bert_sentiment_model.tflite"
    
    # Memuat model TensorFlow Lite
    model = load_model(model_path)
    
    # Tokenizer BERT
    tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')

    input_text = sys.argv[1] if len(sys.argv) > 1 else "I love this product!"  # Ambil input dari command line
    print(f"Input Text: {input_text}")
    
    # Persiapkan data
    processed_data = prepare_data(input_text, tokenizer)
    
    # Lakukan prediksi
    result = make_prediction(model, processed_data)
    
    print(f"Predicted Sentiment: {result}")

if __name__ == "__main__":
    main()
