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
  console.log(song);
  const { metadata, metapages, tabname, type } = song;

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
