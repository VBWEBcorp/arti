import { NextRequest, NextResponse } from 'next/server'

import { sendEmail } from '@/lib/resend'

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Adresse qui reçoit tous les messages/demandes du site (modifiable via env).
const CONTACT_EMAIL = process.env.CONTACT_EMAIL || 'hello@articafeceramique.fr'

function esc(s: string): string {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

// POST /api/contact — message du formulaire de contact → email vers la boutique
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const nom = String(body.nom || '').trim().slice(0, 120)
    const prenom = String(body.prenom || '').trim().slice(0, 120)
    const email = String(body.email || '').trim().slice(0, 200)
    const telephone = String(body.telephone || '').trim().slice(0, 40)
    const message = String(body.message || '').trim().slice(0, 5000)

    if (!nom || !prenom || !message) {
      return NextResponse.json({ error: 'Nom, prénom et message sont requis.' }, { status: 400 })
    }
    if (!emailRe.test(email)) {
      return NextResponse.json({ error: 'Email invalide.' }, { status: 400 })
    }

    const html = `<!DOCTYPE html>
<html lang="fr"><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f1efe9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1efe9;">
    <tr><td align="center" style="padding:28px 14px;">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="width:560px;max-width:100%;background:#ffffff;border-radius:14px;overflow:hidden;">
        <tr><td style="background:#7d8a6f;padding:22px 28px;">
          <div style="font-family:Georgia,'Times New Roman',serif;font-size:18px;color:#ffffff;">Nouveau message — site ARTI</div>
        </td></tr>
        <tr><td style="padding:24px 28px 8px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;color:#1f2421;line-height:1.6;">
            <tr><td style="padding:4px 0;width:120px;color:#7a7f78;">Nom</td><td style="padding:4px 0;"><strong>${esc(prenom)} ${esc(nom)}</strong></td></tr>
            <tr><td style="padding:4px 0;color:#7a7f78;">Email</td><td style="padding:4px 0;"><a href="mailto:${esc(email)}" style="color:#5f6b53;">${esc(email)}</a></td></tr>
            ${telephone ? `<tr><td style="padding:4px 0;color:#7a7f78;">Téléphone</td><td style="padding:4px 0;"><a href="tel:${esc(telephone)}" style="color:#5f6b53;">${esc(telephone)}</a></td></tr>` : ''}
          </table>
        </td></tr>
        <tr><td style="padding:8px 28px 26px;">
          <div style="font-size:12px;text-transform:uppercase;letter-spacing:1.5px;color:#9a9f96;margin-bottom:8px;">Message</div>
          <div style="font-size:15px;line-height:1.7;color:#2b302c;white-space:pre-wrap;background:#faf9f6;border:1px solid #e6e3dc;border-radius:10px;padding:16px 18px;">${esc(message)}</div>
          <p style="margin:18px 0 0;font-size:12px;color:#a7aaa4;">Répondez directement à cet email pour recontacter ${esc(prenom)}.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`

    const res = await sendEmail({
      to: CONTACT_EMAIL,
      subject: `Nouveau message du site — ${prenom} ${nom}`,
      html,
      replyTo: email,
    })

    // sendEmail renvoie null si Resend refuse (domaine, clé…) : on le signale au
    // client pour qu'il puisse réessayer plutôt que de croire à tort à un succès.
    if (!res) {
      return NextResponse.json(
        { error: "L'envoi a échoué. Réessayez ou écrivez-nous directement." },
        { status: 502 }
      )
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
