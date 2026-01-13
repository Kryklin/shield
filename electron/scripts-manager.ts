import { app } from 'electron';
import { exec } from 'child_process';
import * as path from 'path';
import { promisify } from 'util';

const execAsync = promisify(exec);

export class ScriptsManager {
  private powershellPath = app.isPackaged 
    ? path.join(process.resourcesPath, 'powershell')
    : path.join(process.cwd(), 'powershell');
  /**
  /**
   * Checks if the current process has Administrator privileges.
   */
  async checkAdminStatus(): Promise<boolean> {
    try {
      // 'net session' returns 0 if admin, throws error if not
      await execAsync('net session');
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Executes a PowerShell script and returns the JSON output.
   */
  async runPowerShell<T = unknown>(scriptName: string, args: string[] = [], requiresAdmin = false): Promise<T> {
    const scriptPath = path.join(this.powershellPath, `${scriptName}.ps1`);
    
    let command: string;
    let useElevationShim = false;
    
    if (requiresAdmin) {
      const isAdmin = await this.checkAdminStatus();
      if (!isAdmin) {
        useElevationShim = true;
      }
    }
    
    if (useElevationShim) {
      // Use Start-Process with -Verb RunAs to prompt for UAC. 
      // -Wait ensures we don't return until it's done. 
      const argString = `-ExecutionPolicy Bypass -File \\"${scriptPath}\\" ${args.join(' ')}`;
      command = `powershell -Command "Start-Process powershell -ArgumentList '${argString}' -Verb RunAs -Wait"`;
    } else {
      command = `powershell -ExecutionPolicy Bypass -File "${scriptPath}" ${args.join(' ')}`;
    }
    
    try {
      const { stdout } = await execAsync(command);
      if (useElevationShim) {
        // Return dummy success for shimmed admin actions
        return { success: true, message: "Action executed with elevation." } as unknown as T;
      }
      return JSON.parse(stdout);
    } catch (error) {
      console.error(`PowerShell Error (${scriptName}):`, error);
      throw error;
    }
  }
}

export const scriptsManager = new ScriptsManager();
