import { Canvas } from 'datocms-react-ui';
import { RenderItemFormSidebarPanelCtx } from 'datocms-plugin-sdk';
import { useEffect, useState } from 'react';
import { buildClient } from '@datocms/cma-client-browser';

type Prop = {
    token: string,
    audioId: string,
    subtitlesId: string,
    revealedAt: number,
    ctx: RenderItemFormSidebarPanelCtx,
};

type MomentoSubtitle = {
  startTime: number,
  endTime: number,
  text: string,
}

export default function MomentoExperiencePreview({ token, audioId, subtitlesId, revealedAt, ctx }: Prop) {
  const [audioUrl, setAudioUrl] = useState<string>("");
  const [subtitles, setSubtitles] = useState<MomentoSubtitle[]>([]);
  const [activeSubtitle, setActiveSubtitle] = useState<string>(" ");
  const [isRevealed, setIsRevealed] = useState<boolean>(false);
  const client = buildClient({
    apiToken: token,
    environment: 'dev',
  });

  useEffect(() => {

    client.uploads.find(subtitlesId)
      .then(cmsResult => {
        fetch(cmsResult.url)
          .then((response) => response.text())
          .then((text) => {
            //eslint-disable-next-line no-useless-escape
            let pattern = /(\d+)\n([\d:,]+)\s+-{2}\>\s+([\d:,]+)\n([\s\S]*?(?=\n{2}|$))/g;
            let result: MomentoSubtitle[] = [];
            let matches;

            if (text === null) {
              return text;
            }

            let parse = text.replace(/\r\n|\r|\n/g, '\n');

            while ((matches = pattern.exec(parse)) != null) {
              result.push({
                startTime: Number(matches[2].substring(6).replace(",", ".")),
                endTime: Number(matches[3].substring(6).replace(",", ".")),
                text: matches[4],
              })
            }

            setSubtitles(result)
          });
      });

    client.uploads.find(audioId)
      .then(cmsResult => setAudioUrl(cmsResult.url));

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioId, subtitlesId]);

  return (
    <Canvas ctx={ ctx }>

      <p style={{
        borderLeft: "3px solid",
        borderLeftColor: isRevealed
          ? "var(--notice-color)"
          : "var(--disabled-bg-color)",
        paddingLeft: "10px",
        color: isRevealed
          ? "var(--base-body-color)"
          : "var(--placeholder-body-color)"
      }}>
        { isRevealed
          ? `Avslørt ved ${revealedAt}s`
          : "Ikke avslørt ennå"
        }
      </p>

      <p style={{ height: "70px" }}>
        {activeSubtitle}
      </p>

      <audio
        controls
        src={audioUrl}
        onTimeUpdate={(event) => {
          let target = event.target as HTMLAudioElement;
          let currentTime = target.currentTime;
          let subtitle = subtitles.reverse().find(s => {
            return currentTime > s.startTime && currentTime < s.endTime;
          })?.text ?? " ";

          setActiveSubtitle(subtitle);
          setIsRevealed(currentTime > revealedAt);
        }}
      />

    </Canvas>
  );
}
