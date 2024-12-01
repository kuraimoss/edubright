import sys  # Tambahkan ini di atas
import tensorflow as tf
import numpy as np
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

# Fungsi untuk melakukan prediksi
def make_prediction(model, processed_data, classes=['Awful', 'Poor', 'Neutral', 'Good', 'Awesome']):
    input_ids = processed_data['input_ids']
    attention_mask = processed_data['attention_mask']

    input_details = model.get_input_details()
    output_details = model.get_output_details()

    model.set_tensor(input_details[0]['index'], input_ids)
    model.set_tensor(input_details[1]['index'], attention_mask)

    model.invoke()

    output_data = model.get_tensor(output_details[0]['index'])
    prediction = np.argmax(output_data)

    return classes[prediction]

if __name__ == "__main__":
    model_path = './models/bert_sentiment_model.tflite'
    tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')

    # Mendapatkan input teks dari argumen
    input_text = sys.argv[1]
    
    # Memuat model
    model = load_model(model_path)
    
    # Memproses data
    processed_data = prepare_data(input_text, tokenizer)

    # Melakukan prediksi
    result = make_prediction(model, processed_data)

    # Mengembalikan hasil prediksi
    print(json.dumps({"sentiment": result}))
