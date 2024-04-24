import React from "react";
import { Card, CardContent, Typography, Grid } from "@mui/material";

const Song = ({ song }) => {
  // Check if song is undefined
  if (!song) {
    console.log("Song is undefined");
    return null; // or return a placeholder component/message as needed
  }

  // Extract the first object from the song array
  const objsong = song[0];

  // Check if objsong is undefined (this check might not be necessary if you're sure song[0] is always defined)
  if (!objsong) {
    return null; // or handle this case accordingly
  }
  console.log("[OBJSONG]: ", objsong);

  // Destructure properties from the first object (objsong)
  const { metadata, metapages } = objsong;
  let albumDetails = {
    album: metadata[0].text,
    Label: metadata[1].text,
    release: metadata[2].text,
  };
  let songDetails = {
    artist: metapages[0].caption,
    artist_img: metapages[0].image,
    song_name: metapages[1].caption,
    song_img: metapages[1].image,
  };

  return (
    <div className="song">
      <Grid container spacing={2}>
        <Grid item xs={6} sm={6} md={4} lg={3} xl={2}>
          <Card>
            <Typography class="llama-response" variant="body1" component="div">
              <p>Album: {albumDetails.album}</p>
              <p>Label: {albumDetails.Label}</p>
              <p>Release Year: {albumDetails.release}</p>
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={6} sm={6} md={8} lg={9} xl={10}>
          <Card>
            <CardContent>
              <Typography
                class="llama-response"
                variant="body1"
                component="div"
              >
                <p>Artist: {songDetails.artist}</p>
                <p>Song Name: {songDetails.song_name}</p>
                <img class="song-image" src={songDetails.artist_img}></img>
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
};

export default Song;
