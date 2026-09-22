---
sidebar_position: 2
title: Afficher la documentation avec Next.js
menu_title: Next.js
---

Voici un exemple pour intégrer la documentation dans une application Next.js :

```jsx
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { RulePage } from '@publicodes/react-ui';
import engine from '../engine';

export default function Documentation() {
    const router = useRouter();
    return (
        <RulePage
            documentationPath="/documentation"
            engine={engine}
            rulePath={router.query.slug?.join('/')}
            language="fr"
            renderers={{
                Head,
                Link: ({ to, children }) => <Link href={to}>{children}</Link>
            }}
        />
    );
}
```

**[Voir l'exemple complet sur Github](https://github.com/publicodes/publicodes/tree/master/examples/nextjs)**
