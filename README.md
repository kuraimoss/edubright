
### Tools & Dependencies
![WhatsApp Image 2024-12-13 at 16 59 27 (1)](https://github.com/user-attachments/assets/23e5633e-8787-4b70-a642-4f6e50fef06d)

This section outlines the tools and dependencies used in the development and deployment of the backend API application on Google Cloud.

- **Google Cloud**: The cloud platform utilized for deploying the application.
- **Hapi**: A Node.js framework used to build the server.
- **Node.js**: The runtime environment powering the application.
- **MySQL**: The database used for data storage.
- **JWT**: Used for secure user authentication.
- **BCrypt**: Utilized for hashing user passwords.
- **Tokenizers**: Employed for text data processing.

---

### Cloud Architecture
![](https://github.com/user-attachments/assets/9989a5b5-2ded-4019-8d5f-9a7319ea38a7)
The following diagram illustrates the cloud computing architecture of the application.

Users interact with the app via Android smartphones, which connect to the backend running on the **Compute Engine**. The backend integrates with:

- **Cloud Storage**: Stores the machine learning models.
- **Cloud SQL**: Manages the application's database.

---

### Deployment Endpoints
![WhatsApp Image 2024-12-13 at 16 59 27](https://github.com/user-attachments/assets/8d40f8ee-ca20-4801-bc59-530024a46fb0)

Here are the primary endpoints available in this application:

- **Register**: Allows users to create a new account.
- **Login**: Lets users authenticate and log into the system.
- **Sentiment Prediction**: Performs sentiment analysis on the provided data.
- **Comment Feedback**: Enables users to leave feedback via comments.
- **Feedback Statistics**: Displays statistics about user feedback.

The **Compute Engine** connects the machine learning model with the mobile front-end via a virtual machine.
