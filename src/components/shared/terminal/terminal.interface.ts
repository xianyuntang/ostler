export interface Message {
  text: string;
  source: MessageSource;
}

export enum MessageSource {
  Stdin = "stdin",
  Stdout = "stdout",
  Stderr = "stderr",
}
