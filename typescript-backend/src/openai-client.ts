import { setDefaultOpenAIClient } from "@openai/agents";
import OpenAI from "openai";

function ensureTrailingSlash(value: string): string {
  return value.endsWith("/") ? value : `${value}/`;
}

function configureAzureOpenAIClient() {
  const azureApiKey = process.env.AZURE_OPENAI_API_KEY;
  const azureEndpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const azureApiVersion = process.env.AZURE_OPENAI_API_VERSION;

  if (!azureApiKey || !azureEndpoint) return;

  const endpoint = ensureTrailingSlash(azureEndpoint.trim());
  const baseURL = `${endpoint}openai/v1/`;
  const defaultQuery = azureApiVersion ? { "api-version": azureApiVersion } : undefined;

  const client = new OpenAI({
    apiKey: azureApiKey,
    baseURL,
    defaultQuery
  });

  setDefaultOpenAIClient(client as any);

  // The agents tracing exporter expects an OpenAI Platform key.
  // In Azure mode, disable tracing by default to avoid non-fatal 401s.
  process.env.OPENAI_AGENTS_DISABLE_TRACING =
    process.env.OPENAI_AGENTS_DISABLE_TRACING ?? "1";
  process.env.OPENAI_BASE_URL = process.env.OPENAI_BASE_URL ?? baseURL;
}

configureAzureOpenAIClient();
