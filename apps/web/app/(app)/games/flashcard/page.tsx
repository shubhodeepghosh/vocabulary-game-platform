import { redirect } from 'next/navigation'

export default function FlashcardRedirectPage() {
  redirect('/games/spelling-bee')
}
