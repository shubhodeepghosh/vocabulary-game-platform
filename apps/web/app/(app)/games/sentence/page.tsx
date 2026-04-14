import { redirect } from 'next/navigation'

export default function SentenceRedirectPage() {
  redirect('/games/quiz')
}
