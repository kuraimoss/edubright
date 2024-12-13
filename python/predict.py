import sys
import tensorflow as tf
import numpy as np
from transformers import BertTokenizer, TFBertMainLayer

# Fungsi untuk memuat model yang telah dilatih sebelumnya
def load_model(model_path):
    # Menggunakan custom_object_scope untuk memastikan TFBertMainLayer dapat dimuat dengan benar
    with tf.keras.utils.custom_object_scope({'TFBertMainLayer': TFBertMainLayer}):
        # Memuat model dari path yang diberikan
        model = tf.keras.models.load_model(model_path)
    return model

# Fungsi untuk mempersiapkan data teks menjadi format yang dapat diproses model
def prepare_data(input_text, tokenizer):
    # Menggunakan tokenizer BERT untuk mengubah teks menjadi token
    token = tokenizer.encode_plus(
        input_text,
        max_length=256,  # Panjang maksimum token
        truncation=True,  # Memotong teks yang terlalu panjang
        padding='max_length',  # Menambahkan padding jika teks terlalu pendek
        add_special_tokens=True,  # Menambahkan token khusus BERT
        return_tensors='tf'  # Mengembalikan tensor TensorFlow
    )
    return {
        # Mengonversi input_ids dan attention_mask menjadi tipe data integer
        'input_ids': tf.cast(token.input_ids, tf.int32),
        'attention_mask': tf.cast(token.attention_mask, tf.int32)
    }

# Fungsi untuk melakukan prediksi sentimen
def make_prediction(model, processed_data, classes=['Awful', 'Poor', 'Neutral', 'Good', 'Awesome']):
    # Mengekstrak input_ids dan attention_mask dari data yang diproses
    input_ids = processed_data['input_ids']
    attention_mask = processed_data['attention_mask']
    
    # Menyiapkan input untuk prediksi
    input_data = [input_ids, attention_mask]
    # Melakukan prediksi menggunakan model
    preds = model.predict(input_data)
    
    # Mendapatkan kelas dengan probabilitas tertinggi
    prediction = np.argmax(preds, axis=1)[0]
    # Mengembalikan label kelas sesuai prediksi
    return classes[prediction]

# Blok utama yang dijalankan saat script dieksekusi
if __name__ == "__main__":
    # Path menuju model yang telah dilatih
    model_path = 'models/bert_sentiment_model.h5' 
    # Memuat tokenizer BERT yang telah dilatih
    tokenizer = BertTokenizer.from_pretrained('bert-base-cased')

    # Mengambil input teks dari argumen baris perintah
    input_text = sys.argv[1] 
    # Memuat model
    model = load_model(model_path)
    # Mempersiapkan data input
    processed_data = prepare_data(input_text, tokenizer)
    # Melakukan prediksi sentimen
    result = make_prediction(model, processed_data)
    # Mencetak hasil prediksi
    print(result)