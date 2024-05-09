import React from 'react';

class TextToSpeech extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      text: props.text,
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
        <audio src={this.state.audioUrl} controls />
      </div>
    );
  }
}

export default TextToSpeech