import { LegalPage } from '../components/LegalPage'

export function TermsDeletion() {
  return (
    <LegalPage
      title="Account Deletion Terms"
      updated="September 2026"
      sections={[
        {
          heading: 'Overview',
          body: [
            'You can permanently delete your Araku Tribe account at any time from your account settings. This page explains exactly what that does.',
          ],
        },
        {
          heading: 'Immediate Deletion',
          body: [
            'Unlike some services that hold your account for a grace period, deleting your account with us is immediate and permanent — there is no recovery window once you confirm.',
          ],
        },
        {
          heading: 'What Gets Removed',
          body: [
            'Your profile, saved address details, cart contents, and order history are permanently deleted from our systems at the time of deletion.',
          ],
        },
        {
          heading: 'Password Confirmation Required',
          body: [
            'To prevent accidental or unauthorized deletion, we require you to re-enter your password before an account can be deleted.',
          ],
        },
        {
          heading: 'Orders Placed as Guest',
          body: [
            'Orders placed without creating an account are not tied to a login and are unaffected by account deletion.',
          ],
        },
        {
          heading: 'Legal and Financial Records',
          body: [
            'Where required by law (for example, transaction records for tax or fraud-prevention purposes), we may retain minimal records even after account deletion, separate from your personal profile.',
          ],
        },
        {
          heading: 'Questions',
          body: [
            'If you have questions before deleting your account, reach out to us at info@arakutribe.com — we\'re happy to help.',
          ],
        },
      ]}
    />
  )
}
