import { redirect } from 'next/navigation'
export default function Home() {
	redirect(encodeURIComponent('dépenses-primeur'))
}
