import json
import tensorflow as tf
import numpy as np
from transformers import BertTokenizer

# Fungsi untuk mempersiapkan data
def prepare_data(input_text, tokenizer):
    token = tokenizer.encode_plus(
        input_text,
        max_length=256,
        truncation=True,
        padding='max_length',
        add_special_tokens=True,
        return_tensors='np'
    )
    return token['input_ids'], token['attention_mask']

# Fungsi untuk melakukan prediksi
def make_prediction(model, processed_data):
    input_ids, attention_mask = processed_data
    input_ids = np.array(input_ids, dtype=np.int32)
    attention_mask = np.array(attention_mask, dtype=np.int32)
    
    # Prediksi
    input_data = [input_ids, attention_mask]
    output = model.predict(input_data)
    
    # Misalnya output berupa kelas
    predicted_class = np.argmax(output)
    
    # Return sebagai JSON
    return json.dumps({"predicted_class": str(predicted_class)})

# Load tokenizer dan model
tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')
model = tf.lite.Interpreter(model_path="./models/bert_sentiment_model.tflite")

# Ambil input dari argumen
input_text = sys.argv[1]
processed_data = prepare_data(input_text, tokenizer)
result = make_prediction(model, processed_data)

# Print hasil dalam format JSON
print(result)
