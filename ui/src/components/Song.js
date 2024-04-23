import React from 'react';
import Ticker from 'react-ticker';

const Song = ({ song }) => {
	console.log(song)
  const { metadata, metapages, tabname, type } = song;

  return (
    <div className="song">
      <h2>{tabname}</h2>
      <ul>
        {metadata.map((item) => (
          <li key={item.title}>{item.text}</li>
        ))}
      </ul>
      <Ticker speed={10000}>
        {metapages.map((page, index) => (
          <div className="ticker-page" key={index}>
            {page.caption && <h3>{page.caption}</h3>}
            {page.image && <img src={page.image} alt="" />}
            {page.url && <a href={page.url}>{page.url}</a>}
          </div>
        ))}
      </Ticker>
    </div>
  );
};

export default Song;
