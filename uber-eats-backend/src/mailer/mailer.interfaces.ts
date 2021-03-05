export interface MailerModuleOptions {
  sendGridApiKey: string;
}

export interface EmailTemplateVariables {
  username: string;
  code?: string;
  subject: string;
  receiver: string;
}
