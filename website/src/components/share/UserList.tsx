//import { findContrastedTextColor } from '../../../components/utils/colors'
import React from 'react'

export const UserList = ({ users, username }) => (
	<ul style={{ listStyleType: 'none' }}>
		{users.map((u) => (
			<li key={u.name}>
				<div class="avatar">
					<div
						class="avatar__photo avatar__photo--sm"
						style={{ background: u.color }}
					/>
					<div class="avatar__intro">
						<div class="avatar__name">
							{u.name}
							{u.name === username && ' (toi)'}
						</div>
					</div>
				</div>
			</li>
		))}
	</ul>
)

export const UserBlock = ({ extremes, users, username, room }) => {
	const uniqueUsers = getUniqueUsers(users)
	return (
		<div>
			<span>Qui est connecté ?</span>{' '}
			<span role="status">
				👥 {uniqueUsers.length} participant{plural(uniqueUsers)}
			</span>
			<UserList users={uniqueUsers} username={username} />
		</div>
	)
}
const plural = (list) => (list.length > 1 ? 's' : '')

const getUniqueUsers = (array) =>
	array.filter(
		(value, index, self) =>
			index ===
			self.findIndex(
				(elt) => elt.name === value.name && elt.color === value.color
			)
	)
