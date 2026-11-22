# DWC Digital Twin — Work Status

## Current State
- Goal: Digital twin for Dividing Wall Column (DWC), MEG-DEG-TEG separation.
- Approach: GitHub Codespaces + Copilot (Agent Mode) + DWSIM MCP Server (headless, Docker).
- Status: MCP server connected, tools callable. Simple flowsheet works, but rigorous DistillationColumn fails to solve via MCP (internal MaterialStreams metadata not populated by dwsim_unitop_connect).

## Environment / Dependencies
- Docker image: ghcr.io/danwbr/dwsim-mcp:10.2
- Docker run command: docker run -d --name dwsim-mcp -p 5901:5901 ghcr.io/danwbr/dwsim-mcp:10.2
- MCP config: .vscode/mcp.json (HTTP at http://localhost:5901/mcp)
- Agent rules: AGENTS.md
- AI assistant: GitHub Copilot Chat, Agent Mode

## What Works
- dwsim_flowsheet_create, dwsim_thermo_add_compounds, dwsim_thermo_set_property_package
- dwsim_unitop_add, dwsim_stream_add_material, dwsim_stream_add_energy
- dwsim_unitop_connect (physical ports only)
- dwsim_flowsheet_check, dwsim_solve_run, dwsim_solve_diagnostics
- dwsim_flowsheet_get_xml, dwsim_flowsheet_list_objects, dwsim_flowsheet_degrees_of_freedom

## What Does NOT Work Yet
- DistillationColumn cannot solve: NOT_CONVERGED: One or more of the stream connections to the column is missing.
- Root cause: dwsim_unitop_connect connects physical ports, but the column also needs internal MaterialStreams (StreamBehavior + AssociatedStage). Not settable via current MCP tools.
- File load from Codespace to Docker failed (no volume mount; container has its own filesystem).

## Next Steps (TODO)
1. Test a simpler unit op (ComponentSeparator, Splitter, FlashDrum) — Proof of Concept.
2. Build DWC in DWSIM GUI, save as .dwxml, mount into Docker (-v /workspaces/dws:/data), load via dwsim_flowsheet_load.
3. (Optional) Patch dwsim_unitop_connect to accept stream_behavior and stage_number.
4. Automate Docker container startup via devcontainer config.

## Notes
- DWSIM version in container: 10.2
- Property package for water test: Raoult's Law
- For MEG-DEG-TEG: NRTL (to be confirmed)
