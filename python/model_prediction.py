import sys
import json
import tensorflow as tf
from transformers import BertTokenizer, TFBertForSequenceClassification

# Fungsi untuk mempersiapkan data
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
        'input_ids': tf.cast(token.input_ids, tf.float64),
        'attention_mask': tf.cast(token.attention_mask, tf.float64)
    }

# Fungsi untuk memprediksi menggunakan model
def make_prediction(model, processed_data, classes=['Awful', 'Poor', 'Neutral', 'Good', 'Awesome']):
    probs = model.predict(processed_data)[0]
    prediction = classes[tf.argmax(probs, axis=-1).numpy()]
    return prediction

# Memuat model dan tokenizer
model = TFBertForSequenceClassification.from_pretrained('bert-base-uncased', num_labels=5)
tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')

# Mengambil input dari argumen
input_text = sys.argv[1]  # Argumen pertama adalah input text
processed_data = prepare_data(input_text, tokenizer)

# Melakukan prediksi
prediction = make_prediction(model, processed_data)

# Mengembalikan hasil dalam format JSON
print(json.dumps({'prediction': prediction}))
