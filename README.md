# node-RED coreBOS Integration

This is a set of nodes supporting integration with coreBOS

## Installation
run `npm -g install @corebos/node-red-corebos`

## Features
Includes integration for

- login and logout
- query
- CRUD operations
- List Types and Describe
- Invoke

## Usage

There is a configuration node where you can set the credentials to access your coreBOS install. The login node will use the settings to connect to the coreBOS install and send the session credentials to the flow where the other operational nodes will use it to connect.

[You can get some more information in this blog post.](https://joebordes.com/)

## What's next?

- Token based access
- What do you need?
