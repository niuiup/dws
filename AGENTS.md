# AGENTS.md — DWC Digital Twin (Proof of Concept)

## 1. Project Overview
We are building a **digital twin** for a Dividing Wall Column (DWC) to separate a MEG–DEG–TEG mixture.  
The goal is to create a working prototype (MVP) that:
- Builds a DWC-equivalent flowsheet in DWSIM (via two coupled columns, Petlyuk configuration).
- Runs steady-state simulation.
- Validates product purities against the target values from the technical specification.
- Produces a summary report with results and any errors encountered.

## 2. Environment & Tools
- **DWSIM** is installed and running in **headless mode**.
- An **MCP server** (`ol-dwsim-mcp-server`) is running and available to the agent. It provides tools such as:
  - `add_compound`, `add_unit`, `connect`, `run`, `get_results`, `set_parameters`, etc.
- The agent should use these MCP tools to interact with DWSIM. Do **not** try to launch the DWSIM GUI.

## 3. Workflow for Building the DWC Model
1. **Add compounds**: MEG, DEG, TEG (use DWSIM’s compound database).
2. **Add units**: Two distillation columns (representing the prefractionator and main column) and a mixer/splitter to connect them as a Petlyuk arrangement.
3. **Connect streams**: Feed enters prefractionator; vapor from prefractionator goes to main column; liquid from prefractionator goes to main column; products withdrawn from main column.
4. **Set parameters**: Number of stages, feed stage, reflux ratio, pressures. Start with typical literature values for a MEG/DEG/TEG separation.
5. **Run simulation** and check convergence.
6. **Extract results**: Product compositions and flow rates. Compare MEG purity (target ≥ 99.8 wt%), DEG purity (target ≥ 99.5 wt%), TEG purity (target ≥ 98.5 wt%).
7. **Report** success or errors.

## 4. Testing & Error Checking
- After each step, verify that the MCP call succeeded (check return status/messages).
- If a step fails, **do not proceed**. Instead:
  - Log the exact error message.
  - Suggest a fix (e.g., adjust parameters, add missing compound).
  - Ask the user for guidance if the fix is unclear.
- You can run a quick connection test by calling the MCP tool `ping` or `list_tools` (if available).

## 5. Generating a Report
When the user asks for a **report**, produce a clear summary containing:
- **Steps completed** (list of actions taken).
- **Simulation results** (product compositions, energy consumption if available).
- **Errors encountered** (with error messages and attempted fixes).
- **Current status** (success / partial / failed).
- **Recommended next steps**.

The report should be concise but complete. You can output it in Markdown or plain text.

## 6. Boundaries
- Do **not** install or modify DWSIM binaries.
- Do **not** change the MCP server configuration.
- Do **not** attempt to use the DWSIM GUI (it is not available).
- If you need to create temporary files, use the `/tmp` directory.
- Always ask for confirmation before performing destructive actions (e.g., resetting the simulation).

## 7. Communication
- Use the chat to ask clarifying questions if the task is ambiguous.
- When you finish a task, always provide a short summary of what you did and any issues.
- If you get stuck, stop and explain the problem instead of looping endlessly.
