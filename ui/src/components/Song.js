import React from "react";
import {
  TextField,
  Button,
  Box,
  Card,
  CardContent,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";

const Song = ({ song }) => {
  // Check if song is undefined
  if (!song) {
    console.log("Song is undefined");
    return null; // or return a placeholder component/message as needed
  }

  console.log("[song]", song);

  // Extract the first object from the song array
  const objsong = song[0];
  console.log('[objsong]',objsong);

  // Check if objsong is undefined (this check might not be necessary if you're sure song[0] is always defined)
  if (!objsong) {
    console.log("First song object is undefined");
    return null; // or handle this case accordingly
  }

  // Destructure properties from the first object (objsong)
  const { metadata, metapages, tabname, type } = objsong;
  console.log("[metadata]", metadata);
  return (
    <div className="song">
      <h2>{tabname}</h2>
      <ul>
        {metadata?.map((item) => (
          <li key={item.title}>{item.text}</li>
        ))}
        <Card>
          <CardContent>
            <Typography class="llama-response" variant="body1" component="div">
              {metapages?.map((page, index) => (
                <div className="ticker-page" key={index}>
                  {page.caption && <h3>{page.caption}</h3>}
                  {page.image && <img src={page.image} alt="" />}
                  {page.url && <a href={page.url}>{page.url}</a>}
                </div>
              ))}
            </Typography>
          </CardContent>
        </Card>
        ;
      </ul>
    </div>
  );
};

export default Song;
