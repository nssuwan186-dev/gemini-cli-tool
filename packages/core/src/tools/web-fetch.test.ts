/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, vi } from 'vitest';
import { WebFetchTool } from './web-fetch.js';
import { Config, ApprovalMode } from '../config/config.js';

describe('WebFetchTool', () => {
  const mockConfig = {
    getApprovalMode: vi.fn(),
    setApprovalMode: vi.fn(),
  } as unknown as Config;

  describe('shouldConfirmExecute', () => {
    it('should return confirmation details with the correct prompt and urls', async () => {
      const tool = new WebFetchTool(mockConfig);
      const params = { prompt: 'fetch https://example.com' };
      const confirmationDetails = await tool.shouldConfirmExecute(params);

      expect(confirmationDetails).toEqual({
        type: 'info',
        title: 'Confirm Web Fetch',
        prompt: 'fetch https://example.com',
        urls: ['https://example.com'],
        onConfirm: expect.any(Function),
      });
    });

    it('should convert github urls to raw format', async () => {
      const tool = new WebFetchTool(mockConfig);
      const params = {
        prompt:
          'fetch https://github.com/google/gemini-react/blob/main/README.md',
      };
      const confirmationDetails = await tool.shouldConfirmExecute(params);

      expect(confirmationDetails).toEqual({
        type: 'info',
        title: 'Confirm Web Fetch',
        prompt:
          'fetch https://github.com/google/gemini-react/blob/main/README.md',
        urls: [
          'https://raw.githubusercontent.com/google/gemini-react/main/README.md',
        ],
        onConfirm: expect.any(Function),
      });
    });

    it('should return false if approval mode is AUTO_EDIT', async () => {
      const tool = new WebFetchTool({
        ...mockConfig,
        getApprovalMode: () => ApprovalMode.AUTO_EDIT,
      } as unknown as Config);
      const params = { prompt: 'fetch https://example.com' };
      const confirmationDetails = await tool.shouldConfirmExecute(params);

      expect(confirmationDetails).toBe(false);
    });

    it('should convert github urls with query parameters and fragments to raw format', async () => {
      const tool = new WebFetchTool(mockConfig);
      const params = {
        prompt:
          'fetch https://github.com/google/gemini-react/blob/main/foo/bar.md?query=param&token=ghp_XYZ#L10',
      };
      const confirmationDetails = await tool.shouldConfirmExecute(params);

      expect(confirmationDetails).toEqual({
        type: 'info',
        title: 'Confirm Web Fetch',
        prompt:
          'fetch https://github.com/google/gemini-react/blob/main/foo/bar.md?query=param&token=ghp_XYZ#L10',
        urls: [
          'https://raw.githubusercontent.com/google/gemini-react/main/foo/bar.md?query=param&token=ghp_XYZ#L10',
        ],
        onConfirm: expect.any(Function),
      });
    });
  });
});
