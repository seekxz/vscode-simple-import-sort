# simple-import-sort

in `js`, `ts`, `jsx`, `tsx`, `vue` files, sort imports on save.

## Collation

The import of modules should be sorted by the principle of "from large to small, from far to near", and the blank line should be added to group them.

1. If it is an `npm` package, sort it in alphabetical order
2. If you encounter a package starting with `@`, sort it according to the content after `@`
3. If it is `*` all imports
4. If it is a local file, sort it according to the principle of "from large to small, from far to near" according to `../` or `./`
5. Style import
6. Comment import
7. Multi-line import statement import
8. Import directly add url import

## Reason

When writing `go`, `goland` can automatically call `go fmt` to optimize the order of the code in the `import` section.

But in the front-end project, you can configure `eslint` with `sort-imports`, but the function is limited. So look for third-party plug-ins `eslint-plugin-simple-import-sort`.

However, it needs to be configured through eslint, and if you need to configure `prettier` together when saving, it is more troublesome.
In addition, you can also configure vscode's `editor.codeActionsOnSave` to achieve automatic repair of `eslint`.

## Installation

```js
// npm package
import React from 'react'
import {Link} from 'react-router-dom'

// project common function, common components, etc.
import {get} from '@/utils'
import BaseModal from '@/components/BaseModal'

// constants
import {BASE_URL} from '@/constants'

// page components
import TipModal from './tip-modal'

// style
import styles from './index.less'
```
