firebase.auth().onAuthStateChanged(async (user) => {
  if (user) {
    const messageInput = document.querySelector(
      ".chat-input input[type='text']"
    );
    const sendMessageButton = document.querySelector(".chat-input .btn");
    const chatMessagesContainer = document.querySelector(".chat-messages");

    chatMessagesContainer.innerHTML = ""; // Clear previous messages

    // Function to display messages
    const displayMessages = async (messages) => {
      chatMessagesContainer.innerHTML = ""; // Clear previous messages

      // Sort messages by timestamp in ascending order
      messages.sort((a, b) => a.timestamp.toDate() - b.timestamp.toDate());

      for (const messageData of messages) {
        const senderUID = messageData.sender;
        if (senderUID) {
          const doc = await firebase
            .firestore()
            .collection("users")
            .doc(senderUID)
            .get();
          const userData = doc.data();
          if (userData) {
            const timestampDate = messageData.timestamp.toDate();
            const formattedTime = timestampDate.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            });

            const messageElement = document.createElement("div");
            messageElement.classList.add("chat-message");
            messageElement.innerHTML = `
                <img class="profile-image" src="${userData["profile-img"]}" alt="Profile image">
                <div class="message-details">
                  <p class="name">${userData["first-name"]} ${userData["last-name"]}</p>
                  <p class="message">${messageData.message}</p>
                  <p class="timestamp">${formattedTime}</p>
                </div>`;
            chatMessagesContainer.appendChild(messageElement);
            chatMessagesContainer.scrollTop =
              chatMessagesContainer.scrollHeight;
          }
        }
      }
    };

    // Initial display of messages
    const snapshot = await firebase
      .firestore()
      .collection("forums")
      .doc("general")
      .get();
    const messages = snapshot.data().messages || [];
    displayMessages(messages);

    // Listen for changes to messages collection in real-time
    firebase
      .firestore()
      .collection("forums")
      .doc("general")
      .onSnapshot((snapshot) => {
        const messages = snapshot.data().messages || [];
        displayMessages(messages);
      });

    // Send message button click event listener
    sendMessageButton.addEventListener("click", async () => {
      sendMessage();
    });

    messageInput.addEventListener("keydown", async (event) => {
      if (event.key === "Enter") {
        sendMessage();
      }
    });

    const sendMessage = async () => {
      const message = messageInput.value.trim();
      if (message !== "") {
        const messageObj = {
          sender: user.uid,
          message: message,
          timestamp: firebase.firestore.Timestamp.fromDate(new Date()),
        };
        try {
          await firebase
            .firestore()
            .collection("forums")
            .doc("general")
            .update({
              messages: firebase.firestore.FieldValue.arrayUnion(messageObj),
            });
          messageInput.value = "";
        } catch (error) {
          console.error("Error sending message: ", error);
        }
      }
    };
  }
});
