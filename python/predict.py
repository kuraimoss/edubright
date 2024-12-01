import tensorflow as tf
import numpy as np
import sys
import json
from transformers import BertTokenizer

# Fungsi untuk memuat model TensorFlow Lite
def load_model(model_path):
    try:
        interpreter = tf.lite.Interpreter(model_path=model_path)
        interpreter.allocate_tensors()
        return interpreter
    except Exception as e:
        print(f"Error loading model: {e}")
        sys.exit(1)

# Fungsi untuk mempersiapkan data (preprocessing)
def prepare_data(input_text):
    try:
        tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')
        token = tokenizer.encode_plus(
            input_text,
            max_length=256, 
            truncation=True, 
            padding='max_length', 
            add_special_tokens=True,
            return_tensors='tf'
        )
        return {
            'input_ids': tf.cast(token['input_ids'], tf.float32),
            'attention_mask': tf.cast(token['attention_mask'], tf.float32)
        }
    except Exception as e:
        print(f"Error preparing data: {e}")
        sys.exit(1)

# Fungsi untuk menjalankan prediksi dengan model
def make_prediction(interpreter, processed_data):
    try:
        input_details = interpreter.get_input_details()
        output_details = interpreter.get_output_details()
        
        # Menyediakan input pada model
        interpreter.set_tensor(input_details[0]['index'], processed_data['input_ids'])
        interpreter.set_tensor(input_details[1]['index'], processed_data['attention_mask'])
        
        # Menjalankan model
        interpreter.invoke()

        # Mengambil output dari model
        output_data = interpreter.get_tensor(output_details[0]['index'])
        return output_data
    except Exception as e:
        print(f"Error during prediction: {e}")
        sys.exit(1)

if __name__ == "__main__":
    model_path = './models/bert_sentiment_model.tflite'  # Pastikan path ini sesuai
    input_text = sys.argv[1]  # Input teks yang dikirimkan oleh Node.js

    # Memuat model
    model = load_model(model_path)
    
    # Mempersiapkan data untuk model
    processed_data = prepare_data(input_text)
    
    # Melakukan prediksi
    result = make_prediction(model, processed_data)

    # Menampilkan hasil prediksi
    print(json.dumps(result.tolist()))  # Mengirim hasil dalam format JSON
