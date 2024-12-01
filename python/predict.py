import tensorflow as tf
import numpy as np

# Fungsi untuk mempersiapkan data
def prepare_data(input_text, tokenizer):
    token = tokenizer.encode_plus(
        input_text,
        max_length=256, 
        truncation=True, 
        padding='max_length', 
        add_special_tokens=True,
        return_tensors="tf"
    )
    # Mengonversi tensor ke tipe INT32
    return {key: np.array(value, dtype=np.int32) for key, value in token.items()}

# Memuat model TensorFlow Lite
interpreter = tf.lite.Interpreter(model_path="./models/bert_sentiment_model.tflite")
interpreter.allocate_tensors()

# Fungsi untuk prediksi
def predict(input_text, tokenizer):
    try:
        # Menyiapkan data input
        input_data = prepare_data(input_text, tokenizer)

        # Mendapatkan input tensor
        input_details = interpreter.get_input_details()
        output_details = interpreter.get_output_details()

        # Mengatur input tensor dengan data yang sudah dipersiapkan
        interpreter.set_tensor(input_details[0]['index'], input_data['input_ids'])
        interpreter.set_tensor(input_details[1]['index'], input_data['attention_mask'])

        # Menjalankan model
        interpreter.invoke()

        # Mengambil hasil output
        output_data = interpreter.get_tensor(output_details[0]['index'])
        return output_data

    except Exception as e:
        print(f"Error during prediction: {e}")

# Contoh penggunaan
if __name__ == "__main__":
    from transformers import BertTokenizer
    
    # Memuat tokenizer dari Hugging Face
    tokenizer = BertTokenizer.from_pretrained("bert-base-uncased")

    input_text = "I love programming!"
    prediction = predict(input_text, tokenizer)
    print(prediction)
