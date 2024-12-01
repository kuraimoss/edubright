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
        'input_ids': tf.cast(token.input_ids, tf.float32),
        'attention_mask': tf.cast(token.attention_mask, tf.float32)
    }

# Fungsi untuk membuat prediksi menggunakan model TensorFlow Lite
def make_prediction(model, processed_data):
    input_details = model.get_input_details()
    output_details = model.get_output_details()

    # Menyiapkan data input untuk model
    input_data = np.array(processed_data['input_ids'], dtype=np.float32)
    model.set_tensor(input_details[0]['index'], input_data)
    model.invoke()

    # Mendapatkan hasil prediksi
    output_data = model.get_tensor(output_details[0]['index'])
    return output_data

def main():
    # Path ke model TFLite
    model_path = './models/bert_sentiment_model.tflite'

    # Memuat model
    model = load_model(model_path)
    
    # Memuat tokenizer (untuk BERT)
    tokenizer = BertTokenizer.from_pretrained("bert-base-uncased")

    # Mendapatkan input teks dari stdin (input dari Node.js)
    input_text = sys.argv[1]
    
    # Menyiapkan data untuk prediksi
    processed_data = prepare_data(input_text, tokenizer)
    
    # Membuat prediksi
    prediction = make_prediction(model, processed_data)
    
    # Menghasilkan hasil prediksi dalam format JSON
    prediction_result = {
        'prediction': prediction.tolist()  # Mengubah numpy array menjadi list untuk serialisasi JSON
    }
    
    # Menyampaikan hasil ke stdout (untuk diterima Node.js)
    print(json.dumps(prediction_result))

if __name__ == "__main__":
    main()
