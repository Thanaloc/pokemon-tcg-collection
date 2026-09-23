// Transactional emails through Resend. Without RESEND_API_KEY the site keeps
// working as before (accounts are verified on signup) and emails are only
// written to the server logs, which is enough to test the flows locally.

const APP_NAME = 'Pokémon TCG Collection';

export function isEmailEnabled(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

interface Email {
  to: string;
  subject: string;
  text: string;
  html: string;
}

export async function sendEmail({ to, subject, text, html }: Email): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.info(`[email disabled] to=${to} subject="${subject}"\n${text}`);
    return;
  }

  const { Resend } = await import('resend');
  const { error } = await new Resend(apiKey).emails.send({
    from: process.env.EMAIL_FROM || `${APP_NAME} <onboarding@resend.dev>`,
    to,
    subject,
    text,
    html,
  });
  if (error) throw new Error(`Resend: ${error.message}`);
}

function layout(title: string, body: string, cta?: { label: string; url: string }) {
  const button = cta
    ? `<p style="margin:32px 0"><a href="${cta.url}" style="background:#dc2626;color:#fff;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:bold">${cta.label}</a></p>
       <p style="color:#64748b;font-size:13px">Si le bouton ne fonctionne pas, copiez ce lien :<br><a href="${cta.url}" style="color:#dc2626;word-break:break-all">${cta.url}</a></p>`
    : '';
  return `<!doctype html><html><body style="margin:0;background:#f1f5f9;font-family:Arial,sans-serif">
  <div style="max-width:520px;margin:32px auto;background:#fff;border-radius:16px;padding:32px;color:#0f172a">
    <h1 style="font-size:22px;margin:0 0 16px">${title}</h1>
    ${body}
    ${button}
    <p style="color:#94a3b8;font-size:12px;margin-top:32px">${APP_NAME} — cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
  </div></body></html>`;
}

export function verificationEmail(to: string, url: string): Email {
  return {
    to,
    subject: `Confirmez votre adresse email — ${APP_NAME}`,
    text: `Bienvenue !\n\nConfirmez votre adresse email pour activer votre compte :\n${url}\n\nCe lien expire dans 24 heures. Si vous n'êtes pas à l'origine de cette inscription, ignorez cet email.`,
    html: layout(
      'Bienvenue !',
      `<p>Confirmez votre adresse email pour activer votre compte et commencer votre collection.</p>
       <p style="color:#64748b;font-size:14px">Ce lien expire dans 24 heures. Si vous n'êtes pas à l'origine de cette inscription, ignorez cet email.</p>`,
      { label: 'Confirmer mon email', url },
    ),
  };
}

export function passwordResetEmail(to: string, url: string): Email {
  return {
    to,
    subject: `Réinitialisation de votre mot de passe — ${APP_NAME}`,
    text: `Vous avez demandé à réinitialiser votre mot de passe :\n${url}\n\nCe lien expire dans 1 heure. Si vous n'êtes pas à l'origine de cette demande, ignorez cet email : votre mot de passe reste inchangé.`,
    html: layout(
      'Réinitialisation du mot de passe',
      `<p>Vous avez demandé à réinitialiser votre mot de passe.</p>
       <p style="color:#64748b;font-size:14px">Ce lien expire dans 1 heure. Si vous n'êtes pas à l'origine de cette demande, ignorez cet email : votre mot de passe reste inchangé.</p>`,
      { label: 'Choisir un nouveau mot de passe', url },
    ),
  };
}

export function accountExistsEmail(to: string, loginUrl: string, resetUrl: string): Email {
  return {
    to,
    subject: `Vous avez déjà un compte — ${APP_NAME}`,
    text: `Quelqu'un (probablement vous) a essayé de créer un compte avec cette adresse, qui en possède déjà un.\n\nSe connecter : ${loginUrl}\nMot de passe oublié : ${resetUrl}\n\nSi ce n'était pas vous, ignorez cet email.`,
    html: layout(
      'Vous avez déjà un compte',
      `<p>Quelqu'un (probablement vous) a essayé de créer un compte avec cette adresse, qui en possède déjà un.</p>
       <p>Mot de passe oublié ? <a href="${resetUrl}" style="color:#dc2626">Réinitialisez-le ici</a>.</p>
       <p style="color:#64748b;font-size:14px">Si ce n'était pas vous, ignorez cet email.</p>`,
      { label: 'Se connecter', url: loginUrl },
    ),
  };
}
