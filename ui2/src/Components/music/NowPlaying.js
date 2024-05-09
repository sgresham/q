import React from "react";

const NowPlaying = ({ song }) => {
  if (!song) {
    return null; // or return a placeholder component/message as needed
  }

  if (!song.sections) {
    console.log("[song]", song);
    song.sections = [
      {
        metadata: [{ text: "NA" }, { text: "NA" }, { text: "NA" }],
        metapages: [
          { caption: "NA", image: "NA" },
          { caption: "NA", image: "NA" },
        ],
      },
    ];
  }

  const { metadata, metapages } = song.sections[0];
  let albumDetails = {
    album: metadata[0].text,
    label: metadata[1].text,
    release: metadata[2].text,
  };
  let songDetails = {
    artist: metapages[0].caption,
    artist_img: metapages[0].image,
    song_name: metapages[1]?.caption,
    song_img: metapages[1]?.image,
  };

  return (
    <figure class="md:flex bg-slate-100 rounded-xl p-8 md:p-0 dark:bg-slate-800">
      <img
        class="w-24 h-24 md:w-48 md:h-auto md:rounded-none rounded-full mx-auto"
        src={songDetails.artist_img}
        alt=""
        width="384"
        height="512"
      />
      <div class="pt-6 md:p-8 text-center md:text-left space-y-4">
        <blockquote>
          <p class="text-lg font-medium">
            <div class="text-sky-500 dark:text-sky-400">
              Artist: {songDetails.artist}
            </div>
            <div class="text-3xl font-bold text-slate-700 dark:text-slate-500">
              Song: {songDetails.song_name}
            </div>
          </p>
        </blockquote>
        <figcaption class="font-medium">
          <p>Album: {albumDetails.album}</p>
          <p>Label: {albumDetails.label}</p>
          <p>Release Year: {albumDetails.release}</p>
        </figcaption>
      </div>
    </figure>
  );
};

export default NowPlaying;
