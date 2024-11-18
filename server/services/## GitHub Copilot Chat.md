## GitHub Copilot Chat

- Extension Version: 0.22.2 (prod)
- VS Code: vscode/1.95.3
- OS: Windows

## Network

User Settings:

```json
  "github.copilot.advanced": {
    "debug.useElectronFetcher": true,
    "debug.useNodeFetcher": false
  }
```

Connecting to https://api.github.com:

- DNS ipv4 Lookup: 20.205.243.168 (92 ms)
- DNS ipv6 Lookup: Error: getaddrinfo ENOTFOUND api.github.com
- Electron Fetcher (configured): HTTP 200 (217 ms)
- Node Fetcher: HTTP 200 (286 ms)
- Helix Fetcher: HTTP 200 (275 ms)

Connecting to https://api.individual.githubcopilot.com/_ping:

- DNS ipv4 Lookup: 140.82.112.22 (57 ms)
- DNS ipv6 Lookup: Error: getaddrinfo ENOTFOUND api.individual.githubcopilot.com
- Electron Fetcher (configured): HTTP 200 (860 ms)
- Node Fetcher: HTTP 200 (797 ms)
- Helix Fetcher: HTTP 200 (813 ms)

## Documentation

In corporate networks: [Troubleshooting firewall settings for GitHub Copilot](https://docs.github.com/en/copilot/troubleshooting-github-copilot/troubleshooting-firewall-settings-for-github-copilot).
