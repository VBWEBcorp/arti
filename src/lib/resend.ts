import { Resend } from 'resend'
import { getApiKeys } from './apikeys'

let resendInstance: Resend | null = null
let lastKey = ''

async function getResend(): Promise<Resend | null> {
  const keys = getApiKeys()

  if (!keys.resendApiKey) {
    console.warn('Clé Resend non configurée, emails désactivés')
    return null
  }

  if (!resendInstance || lastKey !== keys.resendApiKey) {
    resendInstance = new Resend(keys.resendApiKey)
    lastKey = keys.resendApiKey
  }

  return resendInstance
}

export type EmailAttachment = {
  filename: string
  /** Contenu encodé en base64. */
  content: string
  /** Identifiant pour référencer l'image inline via <img src="cid:..."> (optionnel). */
  contentId?: string
}

export async function sendEmail({
  to,
  subject,
  html,
  replyTo,
  attachments,
}: {
  to: string
  subject: string
  html: string
  replyTo?: string
  attachments?: EmailAttachment[]
}) {
  const client = await getResend()
  if (!client) return null

  const keys = getApiKeys()

  const result = await client.emails.send({
    from: keys.resendFromEmail,
    to,
    subject,
    html,
    ...(replyTo ? { replyTo } : {}),
    ...(attachments && attachments.length
      ? {
          attachments: attachments.map((a) => ({
            filename: a.filename,
            content: a.content,
            ...(a.contentId ? { content_id: a.contentId } : {}),
          })),
        }
      : {}),
  })

  // Le SDK Resend ne lève pas d'exception : il renvoie { data, error }.
  // On journalise un échec (domaine non vérifié, destinataire non autorisé en
  // mode test, etc.) sans faire planter le flux appelant.
  if (result.error) {
    console.error(
      `Resend a refusé l'email (to=${to}, from=${keys.resendFromEmail}):`,
      result.error
    )
    return null
  }

  return result
}
