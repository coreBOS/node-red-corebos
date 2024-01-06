# node-RED coreBOS Integration

This is a set of [node-RED](https://nodered.org/) nodes supporting integrations with [coreBOS](https://corebos.com)

## Installation

The easiest way to install is using Node-RED's Palette Manager.

If you must install manually, follow these steps:

```shell
cd ~/.node-red
npm install @corebos/node-red-corebos
```

## Features

Includes integration for

- login and logout
- query
- CRUD operations
- List Types and Describe
- Invoke

## Usage

There is a configuration node where you can set the credentials to access your coreBOS install. The login node will use the given settings to connect to the coreBOS install and send the session credentials to the flow where the other operational nodes will use it to connect.

It is important to understand that if you have more than one connection you must indicate in each operational node the coreBOS installation to connecto to. That will be determined by the name of the login node with no spaces.

Each node will output a set of properties:

- `payload.corebos` holds the login information of the last login node executed
- `payload.{login node name}` holds the login information of the login node named `login node name`
- most nodes add some meta information in the payload about their execution. For example
  - `create` adds a `created` property which is boolean indicating if the creation was successful or not
  - `update` adds an `updated` property which is boolean indicating if the update was successful or not
  - `query` sets a `totalrows` property to indicate the number of rows retrieved from the query
- query, create, update, retrieve all add a `record` property at the top level of the message with the result of their execution
- create, update and retrieve expect a `module` property to be set at the top level of the message
- retrieve and delete expect a `recordid` property which represents the record to work with
- query, list types and describe return as many message as results they have
- invoke expects two top level properties; `method` and `params` and will return it's result in the `response` property

[You can find more information in this blog post.](https://joebordes.com/node-red-wow)

## What's next?

- Token based access
- Better i18n. Need to learn more.
- List Types and Describe should optionally get their parameters from the message.
- What do you need?
