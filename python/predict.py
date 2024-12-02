import sys
import tensorflow as tf
import numpy as np
import json
from transformers import BertTokenizer, TFBertMainLayer

def load_model(model_path):
    # Daftarkan TFBertMainLayer sebagai custom object
    try:
        with tf.keras.utils.custom_object_scope({'TFBertMainLayer': TFBertMainLayer}):
            model = tf.keras.models.load_model(model_path)
        return model
    except Exception as e:
        return str(e)  # Kembalikan error sebagai string jika gagal

def prepare_data(input_text, tokenizer):
    try:
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
    except Exception as e:
        return str(e)  # Kembalikan error sebagai string jika gagal

def make_prediction(model, processed_data, classes=['Awful', 'Poor', 'Neutral', 'Good', 'Awesome']):
    try:
        input_ids = processed_data['input_ids']
        attention_mask = processed_data['attention_mask']
        
        # Model prediction
        input_data = [input_ids, attention_mask]
        preds = model.predict(input_data)
        
        # Ambil kelas dengan probabilitas tertinggi
        prediction = np.argmax(preds, axis=1)[0]
        return classes[prediction]
    except Exception as e:
        return str(e)  # Kembalikan error sebagai string jika gagal

if __name__ == "__main__":
    model_path = '../models/bert_sentiment_model.h5'  # Ganti dengan path model yang benar
    tokenizer = BertTokenizer.from_pretrained('bert-base-cased')

    input_text = sys.argv[1]  # Ambil input dari argumen
    model = load_model(model_path)

    if isinstance(model, str):  # Jika model error saat dimuat, tampilkan error
        print(json.dumps({"error": model}))
    else:
        processed_data = prepare_data(input_text, tokenizer)
        if isinstance(processed_data, str):  # Jika ada error dalam mempersiapkan data
            print(json.dumps({"error": processed_data}))
        else:
            result = make_prediction(model, processed_data)
            print(json.dumps({"sentiment": result}))
