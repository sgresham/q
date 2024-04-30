import React from 'react';

class TextToSpeech extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      text: `Here's a summary of the conversation:

      The conversation starts with an introduction and some small talk about meeting schedules. The main topic of discussion is Windows Hello, a biometric authentication feature that uses facial recognition, fingerprint scanning, or PIN entry to log in to computers.
      
      The speaker has been researching Windows Hello and its potential benefits for Essential 8 Level 2, which requires multi-factor authentication to log onto a computer. They discuss the different ways users can authenticate themselves, including using their face, fingerprint, or PIN number.
      
      However, the speaker notes that they have experienced some issues with Windows Hello, such as it not working reliably and defaulting back to password entry when it doesn't work. They suggest that Microsoft may need to provide custom configurations to make it work more reliably.
      
      The conversation also touches on the importance of making sure Windows Hello works 99.9% of the time, especially if it's going to be rolled out to a large number of computers (14,000). The speaker suggests that having Microsoft professionals come in and help build the solution could be beneficial.
      
      Overall, the conversation is about exploring the potential benefits and challenges of implementing Windows Hello as part of Essential 8 Level 2.`,
      audioUrl: ''
    };
  }

  componentDidMount() {
    const url = `http://10.10.10.30:7095/tts?text=${encodeURIComponent(this.state.text)}`;
    fetch(url).then(response => response.blob())
      .then(audioBlob => {
        const audioUrl = URL.createObjectURL(audioBlob);
        this.setState({ audioUrl });
      });
  }

  render() {
    return (
      <div>
        <h1>{this.state.text}</h1>
        <audio src={this.state.audioUrl} controls />
      </div>
    );
  }
}

export default TextToSpeech