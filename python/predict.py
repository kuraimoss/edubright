import sys 
import tensorflow as tf
import numpy as np
import json
from transformers import BertTokenizer, TFBertMainLayer


def load_model(model_path):
    # Daftarkan TFBertMainLayer sebagai custom object
    with tf.keras.utils.custom_object_scope({'TFBertMainLayer': TFBertMainLayer}):
        model = tf.keras.models.load_model(model_path)
    return model



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
    model_path = './models/bert_sentiment_model.h5'
    tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')

    
    input_text = sys.argv[1]
    

    model = load_model(model_path)
    

    processed_data = prepare_data(input_text, tokenizer)
    result = make_prediction(model, processed_data)

    print(json.dumps({"sentiment": result}))
