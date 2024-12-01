import sys
import tensorflow as tf
from transformers import BertTokenizer

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

# Fungsi untuk memuat model dan melakukan prediksi
def make_prediction(model, processed_data, classes=['Awful', 'Poor', 'Neutral', 'Good', 'Excellent']):
    logits = model(processed_data)
    prediction = tf.argmax(logits, axis=1).numpy()[0]  # Ambil hasil prediksi kelas
    return classes[prediction]

def main():
    # Ambil input dari stdin
    input_text = sys.argv[1]
    
    # Load model dan tokenizer
    model_path = 'models/bert_sentiment_model.tflite'
    model = tf.saved_model.load(model_path)  # Muat model TensorFlow
    tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')

    # Persiapkan data
    processed_data = prepare_data(input_text, tokenizer)

    # Dapatkan prediksi
    prediction = make_prediction(model, processed_data)
    
    # Cetak hasil ke stdout (untuk dikirimkan kembali ke server Node.js)
    print(prediction)

if __name__ == "__main__":
    main()
