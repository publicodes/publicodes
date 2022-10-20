//import { findContrastedTextColor } from '../../../components/utils/colors'
import React from 'react'

export const UserList = ({ users, username }) => (
	<ul
		css={`
			display: flex;
			list-style-type: none;
			flex-wrap: wrap;
			li {
				margin: 0.6rem;
			}
		`}
	>
		{users.map((u) => (
			<li
				key={u.name}
				css={`
					background: ${u.color};
					color: black;
					padding: 0.1rem 0.4rem;
					border-radius: 0.6rem;
				`}
			>
				{u.name}
				{u.name === username && ' (toi)'}
			</li>
		))}
	</ul>
)

export const UserBlock = ({ extremes, users, username, room }) => {
	const uniqueUsers = getUniqueUsers(users)
	return (
		<div>
			<h2 css="display: inline-block ;margin-right: 1rem">
				👤 Qui est connecté ?
			</h2>
			<span role="status" css="color: #397540; font-weight: bold">
				🟢{uniqueUsers.length} participant{plural(uniqueUsers)}
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
