import { connect } from 'datocms-plugin-sdk';
import { render } from './utils/render';
import ConfigScreen from './entrypoints/ConfigScreen';
import MomentoExperiencePreview from './entrypoints/MomentoExperiencePreview';
import 'datocms-react-ui/styles.css';

type MomentoFormValues = {
  audio?: {
    upload_id?: string,
  },
  subtitles?: {
    upload_id?: string,
  },
  revealed_at?: number,
}


connect({
  renderConfigScreen(ctx) {
    return render(<ConfigScreen ctx={ctx} />);
  },
  itemFormSidebarPanels() {
    return [
      {
        id: 'momentoExperiencePreview',
        label: 'Momento Experience',
      },
    ];
  },
  renderItemFormSidebarPanel(sidebarPaneId, ctx) {
    let token = ctx.currentUserAccessToken ?? null
    let formValues = ctx.formValues as MomentoFormValues
    let audioId = formValues?.audio?.upload_id;
    let subtitlesId = formValues?.subtitles?.upload_id;
    let revealedAt = Number(formValues?.revealed_at);

    if (token && audioId && subtitlesId && !isNaN(revealedAt)) {
      render(<MomentoExperiencePreview
        token={token}
        audioId={audioId}
        subtitlesId={subtitlesId}
        revealedAt={revealedAt}
        ctx={ctx}
      />);
    } else {
      render(
        <p>Unable to render Experience</p>
      )
    }
  },
});
