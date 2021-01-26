import Mail from '../../lib/Mail'
import { ISendMail, ISendRecoveryPasswordMail, IMail, ISendInviteUserMail } from './types'

const frontUrl = 'https://afiliados.b8one.com'

const sendSignUpMail = async (data: ISendMail) => {
  if (process.env.NODE_ENV === 'test') return

  try {
    await Mail.sendMail({
      from: 'Loja Integrada No-reply <noreply@plugone.io>',
      to: `${data.username || ''} <${data.email}>`,
      subject: 'Bem vindo(a) ao Programa de Afiliados Indicaê da Loja Integrada!',
      html: `
      <!DOCTYPE html>
      <html lang="pt-BR" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
      <head>
          <meta charset="utf-8">
          <meta http-equiv="x-ua-compatible" content="ie=edge">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <meta name="x-apple-disable-message-reformatting">
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
          <title></title>
          <!--[if mso]>
          <xml>
          <o:OfficeDocumentSettings>
              <o:PixelsPerInch>96</o:PixelsPerInch>
          </o:OfficeDocumentSettings>
          </xml>
      </head>
      <body>
        <div bgcolor="#ffffff" style="margin:0!important;padding:0!important;font-family:Arial,sans-serif;font-size:15px;color:#23496d;word-break:break-word">
            
        <div id="m_-7704969684652969272preview_text" style="display:none!important;font-size:1px;color:#ffffff;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden">A Newsletter de Parceiros é mensal e traz as novidades dos parceiros de Temas, Serviços e Agências da Loja Integrada! Fique por dentro!</div>
            

            <div style="background-color:#ffffff" bgcolor="#ffffff">
              <table role="presentation" cellpadding="0" cellspacing="0" style="border-spacing:0!important;border-collapse:collapse;margin:0;padding:0;width:100%!important;min-width:320px!important;height:100%!important" width="100%" height="100%">
                <tbody><tr>
                  <td valign="top" style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:15px;color:#23496d;word-break:break-word">
                    <div id="m_-7704969684652969272hs_cos_wrapper_main" style="color:inherit;font-size:inherit;line-height:inherit">  <div id="m_-7704969684652969272section-0" class="m_-7704969684652969272hse-section" style="padding-left:10px;padding-right:10px;padding-top:20px">
            
            
            
              <div class="m_-7704969684652969272hse-column-container" style="min-width:280px;max-width:600px;width:100%;Margin-left:auto;Margin-right:auto;border-collapse:collapse;border-spacing:0;background-color:#ffffff" bgcolor="#ffffff">
            
            
            
            

        <div id="m_-7704969684652969272column-0-1" class="m_-7704969684652969272hse-column m_-7704969684652969272hse-size-12">
          <div id="m_-7704969684652969272hs_cos_wrapper_module_16075375198592" style="color:inherit;font-size:inherit;line-height:inherit">
          
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-spacing:0!important;border-collapse:collapse">
            <tbody>
                <tr>
                    <td align="center" valign="top" style="border-collapse:collapse;font-family:Arial,sans-serif;color:#23496d;word-break:break-word;text-align:center;padding:10px 20px;font-size:0px">
                        
                        <img alt="header-email-indicaê" src="https://ci6.googleusercontent.com/proxy/v48OVLTOXOogw-crvXmujb2lqxE-TvHgfv9zEGI0O2-BxE3JCk_SEQnCUVXbB8r8lX1V9lyogswbCIrp6OogEK2bWzy5AlGBY2IqJe8YW1YuewlDbHUzYPotODYeX4x08up0RKkKZdWHCJn63SDeG4wxzm-bz2vXrErGA-OhuA1UanPMK0uBiN-z7oqJs6jn2pJuygTdM1j6QVKbcGIy-V6iHBtZEw=s0-d-e1-ft#https://hs-7112881.f.hubspotemail.net/hub/7112881/hubfs/header-email-indicae%CC%82.png?width=1120&amp;upscale=true&amp;name=header-email-indicae%CC%82.png" style="outline:none;text-decoration:none;max-width:100%;font-size:16px" width="560" align="middle" class="CToWUd">
                        
                    </td>
                </tr>
            </tbody>
        </table>
        </div>
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-spacing:0!important;border-collapse:collapse"><tbody><tr><td class="m_-7704969684652969272hs_padded" style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:15px;color:#23496d;word-break:break-word;padding:10px 20px"><div id="m_-7704969684652969272hs_cos_wrapper_module_16075375312833" style="color:inherit;font-size:inherit;line-height:inherit"><div id="m_-7704969684652969272hs_cos_wrapper_module_16075375312833_" style="color:inherit;font-size:inherit;line-height:inherit"><p style="font-size:22px;line-height:150%;text-align:center" align="center"><strong>Confirmação de cadastro</strong></p></div></div></td></tr></tbody></table>
        <div id="m_-7704969684652969272hs_cos_wrapper_module_160821938862919" style="color:inherit;font-size:inherit;line-height:inherit">
          
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-spacing:0!important;border-collapse:collapse">
            <tbody>
                <tr>
                    <td align="center" valign="top" style="border-collapse:collapse;font-family:Arial,sans-serif;color:#23496d;word-break:break-word;text-align:center;padding:10px 20px;font-size:0px">
                        
                        <img alt="banner-email-1" src="https://ci6.googleusercontent.com/proxy/cf_F0NnUkZ3ZFUGhPxHWCwNIW1jGJNeJ41Z0p2cZepT0dWPu5Fk5PSpWBvdgIi-oCWy8Ors3HTfYnoB-ko0gHtdPpZPfiwe4pJHWinRIqE_DeIkYXjwXcuwZAnhh3a0ju4Ck8e0SMZLuSLnl_zZMEm_Kxzwu83Dfk04XEKQlzUZAE_rITeJFNykwBInC=s0-d-e1-ft#https://hs-7112881.f.hubspotemail.net/hub/7112881/hubfs/banner-email-1.png?width=1120&amp;upscale=true&amp;name=banner-email-1.png" style="outline:none;text-decoration:none;max-width:100%;font-size:16px" width="560" align="middle" class="CToWUd a6T" tabindex="0"><div class="a6S" dir="ltr" style="opacity: 0.01; left: 791.6px; top: 322.4px;"><div id=":mt" class="T-I J-J5-Ji aQv T-I-ax7 L3 a5q" role="button" tabindex="0" aria-label="Fazer o download do anexo " data-tooltip-class="a1V" data-tooltip="Fazer o download"><div class="akn"><div class="aSK J-J5-Ji aYr"></div></div></div></div>
                        
                    </td>
                </tr>
            </tbody>
        </table>
        </div>
        </div>


            
            </div>
          
          </div>
          <div id="m_-7704969684652969272section_1610137974527" class="m_-7704969684652969272hse-section" style="padding-left:10px;padding-right:10px">
            
            
            
              <div class="m_-7704969684652969272hse-column-container" style="min-width:280px;max-width:600px;width:100%;Margin-left:auto;Margin-right:auto;border-collapse:collapse;border-spacing:0;background-color:#ffffff" bgcolor="#ffffff">
            
            
            
            

        <div id="m_-7704969684652969272column_1610137974528_0" class="m_-7704969684652969272hse-column m_-7704969684652969272hse-size-12">
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-spacing:0!important;border-collapse:collapse"><tbody><tr><td class="m_-7704969684652969272hs_padded" style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:15px;color:#23496d;word-break:break-word;padding:10px 20px"><div id="m_-7704969684652969272hs_cos_wrapper_module_16101379887913" style="color:inherit;font-size:inherit;line-height:inherit"><div id="m_-7704969684652969272hs_cos_wrapper_module_16101379887913_" style="color:inherit;font-size:inherit;line-height:inherit"><p style="line-height:175%"><span style="color:#738096">Olá${
            ', ' + data.username || ''
          }!&nbsp;</span></p>
        <p style="line-height:175%">&nbsp;</p>
        <p style="line-height:175%"><span style="color:#738096">Seja bem-vindo ao Programa de Indicação da Loja Integrada!</span></p>
        <p style="line-height:175%"><span style="color:#738096">Confirme o seu e-mail para começar a realizar suas indicações.</span></p></div></div></td></tr></tbody></table>
        </div>


            
            </div>
          
          </div>
          <div id="m_-7704969684652969272section_1610138015341" class="m_-7704969684652969272hse-section" style="padding-left:10px;padding-right:10px">
            
            
            
              <div class="m_-7704969684652969272hse-column-container" style="min-width:280px;max-width:600px;width:100%;Margin-left:auto;Margin-right:auto;border-collapse:collapse;border-spacing:0;background-color:#ffffff" bgcolor="#ffffff">
            
            
            
            

        <div id="m_-7704969684652969272column_1610138015341_0" class="m_-7704969684652969272hse-column m_-7704969684652969272hse-size-12">
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-spacing:0!important;border-collapse:collapse"><tbody><tr><td class="m_-7704969684652969272hs_padded" style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:15px;color:#23496d;word-break:break-word;padding:19px 20px 10px 18px"><div id="m_-7704969684652969272hs_cos_wrapper_module_160821926267616" style="color:inherit;font-size:inherit;line-height:inherit">
          
          <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-spacing:0!important;border-collapse:separate!important">
            <tbody><tr>
                
            
              <td align="center" valign="middle" bgcolor="#42C0C4" role="presentation" style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:15px;color:#23496d;word-break:break-word;border-radius:5px;background-color:#42c0c4">
          
                <a href="${frontUrl}/verification/${
        data.hashToVerify
      }" style="font-size:16px;font-family:Arial,sans-serif;color:#ffffff;font-weight:normal;text-decoration:none;font-style:normal;Margin:0;text-transform:none;padding:12px 18px;display:block">
                  Confirmar e-mail
                </a>
              </td>
            </tr>
          </tbody></table>
        </div></td></tr></tbody></table>
        </div>


            
            </div>
          
          </div>
          <div id="m_-7704969684652969272section-1" class="m_-7704969684652969272hse-section" style="padding-left:10px;padding-right:10px;padding-bottom:20px">
            
            
            
              <div class="m_-7704969684652969272hse-column-container" style="min-width:280px;max-width:600px;width:100%;Margin-left:auto;Margin-right:auto;border-collapse:collapse;border-spacing:0">
            
            
            
            

        <div id="m_-7704969684652969272column-1-1" class="m_-7704969684652969272hse-column m_-7704969684652969272hse-size-12">
          <div id="m_-7704969684652969272hs_cos_wrapper_module_160821833507510" style="color:inherit;font-size:inherit;line-height:inherit">
          
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-spacing:0!important;border-collapse:collapse">
            <tbody>
                <tr>
                    <td align="center" valign="top" style="border-collapse:collapse;font-family:Arial,sans-serif;color:#23496d;word-break:break-word;text-align:center;padding:0px 20px;font-size:0px">
                        
                        <img alt="footer-2 (1)" src="https://ci4.googleusercontent.com/proxy/Jgc5jYutFAhzj_yYWtfKOVQ1RGpJCXk1fU0odc59bPLPdHer5JOWM-UdTLJdWelw3P2PgLOJo83FFItfncDvFwQvrmBB_BKpcr7cx6o4cGfGd1QxgV2aGST22LUCvR3QWVkXH8hrnONckCpHjVUjLY25Y_snIBzJKmyr2DSC4gM48HXdMNvDJ18vId0e=s0-d-e1-ft#https://hs-7112881.f.hubspotemail.net/hub/7112881/hubfs/footer-2%20(1).png?width=1120&amp;upscale=true&amp;name=footer-2%20(1).png" style="outline:none;text-decoration:none;max-width:100%;font-size:16px" width="560" align="middle" class="CToWUd a6T" tabindex="0"><div class="a6S" dir="ltr" style="opacity: 0.01; left: 791.6px; top: 723.2px;"><div id=":mu" class="T-I J-J5-Ji aQv T-I-ax7 L3 a5q" title="Fazer o download" role="button" tabindex="0" aria-label="Fazer o download do anexo " data-tooltip-class="a1V"><div class="akn"><div class="aSK J-J5-Ji aYr"></div></div></div></div>
                        
                    </td>
                </tr>
            </tbody>
        </table>
        </div>
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-spacing:0!important;border-collapse:collapse"><tbody><tr><td class="m_-7704969684652969272hs_padded" style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:15px;color:#23496d;word-break:break-word;padding:0px 20px"><div id="m_-7704969684652969272hs_cos_wrapper_module-1-1-1" style="color:inherit;font-size:inherit;line-height:inherit">
          
          
          
          
          
          
          

            
        </div></td></tr></tbody></table>
        </div>


            
            </div>
          
          </div>
        </div>
                  </td>
                </tr>
              </tbody></table>
            </div>
          
        <img src="https://ci3.googleusercontent.com/proxy/UE5-ymwukKIi_r95785kSZee2VVFsLTnjG16xN6XDQi0iyhpGZFPt85OJzF2d1IPbV7ic15qpGRZr8XwiTwGwE5bry0gEgE4GyGeLNIQOhTEf_80w9nKkWC3jV4k0ikQWUDJubHkyQ=s0-d-e1-ft#https://i7.t.hubspotemail.net/e2t/to/VWzKbQ8yhNgzW4BTnkz1FZs-GW5LNP254lLHFRf48YJZw22" alt="" width="1" height="1" border="0" style="display:none!important;min-height:1px!important;width:1px!important;border-width:0!important;margin-top:0!important;margin-bottom:0!important;margin-right:0!important;margin-left:0!important;padding-top:0!important;padding-bottom:0!important;padding-right:0!important;padding-left:0!important" class="CToWUd"></div>
      </body>
      </html>
      `,
    })
  } catch (e) {
    console.log(e)
    throw new Error(e.message)
  }
}

const sendRecoveryPasswordMail = async (data: ISendRecoveryPasswordMail) => {
  if (process.env.NODE_ENV === 'test') return

  try {
    await Mail.sendMail({
      from: 'Loja Integrada No-reply <noreply@plugone.io>',
      to: `${data.username || ''} <${data.email}>`,
      subject: 'Recuperacão de senha - Programa de Afiliados Indicaê da Loja Integrada',
      html: `
            <!DOCTYPE html>
            <html lang="pt-BR" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
              <head>
                <meta charset="utf-8">
                <meta http-equiv="x-ua-compatible" content="ie=edge">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <meta name="x-apple-disable-message-reformatting">
                <title></title>
                <!--[if mso]>
                <xml>
                  <o:OfficeDocumentSettings>
                    <o:PixelsPerInch>96</o:PixelsPerInch>
                  </o:OfficeDocumentSettings>
                </xml>
              </head>
              <body>

                <div bgcolor="#ffffff" style="margin:0!important;padding:0!important;font-family:Arial,sans-serif;font-size:15px;color:#23496d;word-break:break-word"><span class="im">
                    
                <div id="m_-219893587248066579preview_text" style="display:none!important;font-size:1px;color:#ffffff;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden">A Newsletter de Parceiros é mensal e traz as novidades dos parceiros de Temas, Serviços e Agências da Loja Integrada! Fique por dentro!</div>
                    

                    </span><div style="background-color:#ffffff" bgcolor="#ffffff">
                      <table role="presentation" cellpadding="0" cellspacing="0" style="border-spacing:0!important;border-collapse:collapse;margin:0;padding:0;width:100%!important;min-width:320px!important;height:100%!important" width="100%" height="100%">
                        <tbody><tr>
                          <td valign="top" style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:15px;color:#23496d;word-break:break-word">
                            <div id="m_-219893587248066579hs_cos_wrapper_main" style="color:inherit;font-size:inherit;line-height:inherit">  <div id="m_-219893587248066579section-0" class="m_-219893587248066579hse-section" style="padding-left:10px;padding-right:10px;padding-top:20px">
                    
                    
                    
                      <div class="m_-219893587248066579hse-column-container" style="min-width:280px;max-width:600px;width:100%;Margin-left:auto;Margin-right:auto;border-collapse:collapse;border-spacing:0;background-color:#ffffff" bgcolor="#ffffff">
                    
                    
                    
                    

                <div id="m_-219893587248066579column-0-1" class="m_-219893587248066579hse-column m_-219893587248066579hse-size-12">
                  <div id="m_-219893587248066579hs_cos_wrapper_module_16075375198592" style="color:inherit;font-size:inherit;line-height:inherit">
                  
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-spacing:0!important;border-collapse:collapse">
                    <tbody>
                        <tr>
                            <td align="center" valign="top" style="border-collapse:collapse;font-family:Arial,sans-serif;color:#23496d;word-break:break-word;text-align:center;padding:10px 20px;font-size:0px">
                                
                                <img alt="header-email-indicaê" src="https://ci6.googleusercontent.com/proxy/v48OVLTOXOogw-crvXmujb2lqxE-TvHgfv9zEGI0O2-BxE3JCk_SEQnCUVXbB8r8lX1V9lyogswbCIrp6OogEK2bWzy5AlGBY2IqJe8YW1YuewlDbHUzYPotODYeX4x08up0RKkKZdWHCJn63SDeG4wxzm-bz2vXrErGA-OhuA1UanPMK0uBiN-z7oqJs6jn2pJuygTdM1j6QVKbcGIy-V6iHBtZEw=s0-d-e1-ft#https://hs-7112881.f.hubspotemail.net/hub/7112881/hubfs/header-email-indicae%CC%82.png?width=1120&amp;upscale=true&amp;name=header-email-indicae%CC%82.png" style="outline:none;text-decoration:none;max-width:100%;font-size:16px" width="560" align="middle" class="CToWUd">
                                
                            </td>
                        </tr>
                    </tbody>
                </table>
                </div>
                <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-spacing:0!important;border-collapse:collapse"><tbody><tr><td class="m_-219893587248066579hs_padded" style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:15px;color:#23496d;word-break:break-word;padding:10px 20px"><div id="m_-219893587248066579hs_cos_wrapper_module_16075375312833" style="color:inherit;font-size:inherit;line-height:inherit"><div id="m_-219893587248066579hs_cos_wrapper_module_16075375312833_" style="color:inherit;font-size:inherit;line-height:inherit"><p style="font-size:22px;line-height:150%;text-align:center" align="center"><strong>Recuperação de senha&nbsp;</strong></p></div></div></td></tr></tbody></table>
                <div id="m_-219893587248066579hs_cos_wrapper_module_160821938862919" style="color:inherit;font-size:inherit;line-height:inherit">
                  
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-spacing:0!important;border-collapse:collapse">
                    <tbody>
                        <tr>
                            <td align="center" valign="top" style="border-collapse:collapse;font-family:Arial,sans-serif;color:#23496d;word-break:break-word;text-align:center;padding:10px 20px;font-size:0px">
                                
                                <img alt="banner-email-senha" src="https://ci4.googleusercontent.com/proxy/7RkdSUlY-dGZ8luUeR0qpYsNAGLdh7jFqjXe5sGNEDv3xUrCZxsu1V4fIWWuAY9HCFpeVXgjKuPqi_zgWtOlLQL0x8MnCJXIKcpAg_52e206UZg-EXG37f1Plk_FqB7ki1xDv5nuezdNFSTYJO-3blPcon2jvN_yCtCOb8UcIJFhfmugvjurEukbciy6UGy7IfhLsAwm=s0-d-e1-ft#https://hs-7112881.f.hubspotemail.net/hub/7112881/hubfs/banner-email-senha.png?width=1120&amp;upscale=true&amp;name=banner-email-senha.png" style="outline:none;text-decoration:none;max-width:100%;font-size:16px" width="560" align="middle" class="CToWUd a6T" tabindex="0"><div class="a6S" dir="ltr" style="opacity: 1; left: 792px; top: 322.4px;"><div id=":nf" class="T-I J-J5-Ji aQv T-I-ax7 L3 a5q" role="button" tabindex="0" aria-label="Fazer o download do anexo " data-tooltip-class="a1V" data-tooltip="Fazer o download"><div class="akn"><div class="aSK J-J5-Ji aYr"></div></div></div></div>
                                
                            </td>
                        </tr>
                    </tbody>
                </table>
                </div>
                </div>


                    
                    </div>
                  
                  </div>
                  <div id="m_-219893587248066579section_1610137974527" class="m_-219893587248066579hse-section" style="padding-left:10px;padding-right:10px">
                    
                    
                    
                      <div class="m_-219893587248066579hse-column-container" style="min-width:280px;max-width:600px;width:100%;Margin-left:auto;Margin-right:auto;border-collapse:collapse;border-spacing:0;background-color:#ffffff" bgcolor="#ffffff">
                    
                    
                    
                    

                <div id="m_-219893587248066579column_1610137974528_0" class="m_-219893587248066579hse-column m_-219893587248066579hse-size-12">
                  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-spacing:0!important;border-collapse:collapse"><tbody><tr><td class="m_-219893587248066579hs_padded" style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:15px;color:#23496d;word-break:break-word;padding:10px 20px"><div id="m_-219893587248066579hs_cos_wrapper_module_16101379887913" style="color:inherit;font-size:inherit;line-height:inherit"><div id="m_-219893587248066579hs_cos_wrapper_module_16101379887913_" style="color:inherit;font-size:inherit;line-height:inherit"><p style="line-height:175%"><span style="color:#738096">Olá${
                    ', ' + data.username || ''
                  }!&nbsp;</span></p>
                <p style="line-height:175%">&nbsp;</p>
                <p style="line-height:175%"><span style="color:#738096">Esqueceu sua senha? Não se preocupe! Isso acontece. Para escolher uma nova senha, clique no link abaixo:</span></p></div></div></td></tr></tbody></table>
                </div>


                    
                    </div>
                  
                  </div>
                  <div id="m_-219893587248066579section_1610138015341" class="m_-219893587248066579hse-section" style="padding-left:10px;padding-right:10px">
                    
                    
                    
                      <div class="m_-219893587248066579hse-column-container" style="min-width:280px;max-width:600px;width:100%;Margin-left:auto;Margin-right:auto;border-collapse:collapse;border-spacing:0;background-color:#ffffff" bgcolor="#ffffff">
                    
                    
                    
                    

                <div id="m_-219893587248066579column_1610138015341_0" class="m_-219893587248066579hse-column m_-219893587248066579hse-size-12">
                  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-spacing:0!important;border-collapse:collapse"><tbody><tr><td class="m_-219893587248066579hs_padded" style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:15px;color:#23496d;word-break:break-word;padding:19px 20px 10px 18px"><div id="m_-219893587248066579hs_cos_wrapper_module_160821926267616" style="color:inherit;font-size:inherit;line-height:inherit">
                  
                  <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-spacing:0!important;border-collapse:separate!important">
                    <tbody><tr>
                        
                    
                      <td align="center" valign="middle" bgcolor="#42C0C4" role="presentation" style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:15px;color:#23496d;word-break:break-word;border-radius:5px;background-color:#42c0c4">
                  
                        <a href="${frontUrl}/recovery-password/change-password/${
        data.hashToVerify
      }" style="font-size:16px;font-family:Arial,sans-serif;color:#ffffff;font-weight:normal;text-decoration:none;font-style:normal;Margin:0;text-transform:none;padding:12px 18px;display:block">
                          Escolher nova senha 
                        </a>
                      </td>
                    </tr>
                  </tbody></table>
                </div></td></tr></tbody></table>
                </div>


                    
                    </div>
                  
                  </div><span class="im">
                  <div id="m_-219893587248066579section-1" class="m_-219893587248066579hse-section" style="padding-left:10px;padding-right:10px;padding-bottom:20px">
                    
                    
                    
                      <div class="m_-219893587248066579hse-column-container" style="min-width:280px;max-width:600px;width:100%;Margin-left:auto;Margin-right:auto;border-collapse:collapse;border-spacing:0">
                    
                    
                    
                    

                <div id="m_-219893587248066579column-1-1" class="m_-219893587248066579hse-column m_-219893587248066579hse-size-12">
                  <div id="m_-219893587248066579hs_cos_wrapper_module_160821833507510" style="color:inherit;font-size:inherit;line-height:inherit">
                  
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-spacing:0!important;border-collapse:collapse">
                    <tbody>
                        <tr>
                            <td align="center" valign="top" style="border-collapse:collapse;font-family:Arial,sans-serif;color:#23496d;word-break:break-word;text-align:center;padding:0px 20px;font-size:0px">
                                
                                <img alt="footer-2 (1)" src="https://ci4.googleusercontent.com/proxy/Jgc5jYutFAhzj_yYWtfKOVQ1RGpJCXk1fU0odc59bPLPdHer5JOWM-UdTLJdWelw3P2PgLOJo83FFItfncDvFwQvrmBB_BKpcr7cx6o4cGfGd1QxgV2aGST22LUCvR3QWVkXH8hrnONckCpHjVUjLY25Y_snIBzJKmyr2DSC4gM48HXdMNvDJ18vId0e=s0-d-e1-ft#https://hs-7112881.f.hubspotemail.net/hub/7112881/hubfs/footer-2%20(1).png?width=1120&amp;upscale=true&amp;name=footer-2%20(1).png" style="outline:none;text-decoration:none;max-width:100%;font-size:16px" width="560" align="middle" class="CToWUd a6T" tabindex="0"><div class="a6S" dir="ltr" style="opacity: 0.01;"><div id=":ng" class="T-I J-J5-Ji aQv T-I-ax7 L3 a5q" title="Fazer o download" role="button" tabindex="0" aria-label="Fazer o download do anexo " data-tooltip-class="a1V"><div class="akn"><div class="aSK J-J5-Ji aYr"></div></div></div></div>
                                
                            </td>
                        </tr>
                    </tbody>
                </table>
                </div>
                <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-spacing:0!important;border-collapse:collapse"><tbody><tr><td class="m_-219893587248066579hs_padded" style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:15px;color:#23496d;word-break:break-word;padding:0px 20px"><div id="m_-219893587248066579hs_cos_wrapper_module-1-1-1" style="color:inherit;font-size:inherit;line-height:inherit">
                  
                  
                  
                  
                  
                  
                  

                </div></td></tr></tbody></table>
                </div>


                    
                    </div>
                  
                  </div>
                </span></div>
                          </td>
                        </tr>
                      </tbody></table>
                    </div>
                  
                <img src="https://ci5.googleusercontent.com/proxy/MMOJJYbTl2OvNVGKMY2lISV2v0trRwW1ZnnxZ7oo5h83mM77McmVxWuC7zGUdmgEAP4ZLAukFNx4wjPV8WJhi83kxyKCkqn7lGTWAzpWS8yfbUF7lEB1eSYOcIz11gAa1GyNyYEj=s0-d-e1-ft#https://i7.t.hubspotemail.net/e2t/to/VVxwQ_1CkCffW2W_Jbq4Y_mFzVJvnzy4lLJ2Kf4lQrtr22" alt="" width="1" height="1" border="0" style="display:none!important;min-height:1px!important;width:1px!important;border-width:0!important;margin-top:0!important;margin-bottom:0!important;margin-right:0!important;margin-left:0!important;padding-top:0!important;padding-bottom:0!important;padding-right:0!important;padding-left:0!important" class="CToWUd"></div>
                       
              </body>
            </html>
            
                 `,
    })
  } catch (e) {
    throw new Error(e.message)
  }
}

const sendRecoveredPasswordMail = async (data: IMail) => {
  if (process.env.NODE_ENV === 'test') return

  try {
    await Mail.sendMail({
      from: 'Loja Integrada No-reply <noreply@plugone.io>',
      to: `${data.username || ''} <${data.email}>`,
      subject: 'Senha recuperada - Programa de Afiliados Indicaê da Loja Integrada',
      html: `
      <!DOCTYPE html>
      <html lang="pt-BR" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
        <head>
          <meta charset="utf-8">
          <meta http-equiv="x-ua-compatible" content="ie=edge">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <meta name="x-apple-disable-message-reformatting">
          <title></title>
          <!--[if mso]>
          <xml>
            <o:OfficeDocumentSettings>
              <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
          </xml>
        </head>
        <body>

          <div bgcolor="#ffffff" style="margin:0!important;padding:0!important;font-family:Arial,sans-serif;font-size:15px;color:#23496d;word-break:break-word"><span class="im">
              
          <div id="m_-219893587248066579preview_text" style="display:none!important;font-size:1px;color:#ffffff;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden">A Newsletter de Parceiros é mensal e traz as novidades dos parceiros de Temas, Serviços e Agências da Loja Integrada! Fique por dentro!</div>
              

              </span><div style="background-color:#ffffff" bgcolor="#ffffff">
                <table role="presentation" cellpadding="0" cellspacing="0" style="border-spacing:0!important;border-collapse:collapse;margin:0;padding:0;width:100%!important;min-width:320px!important;height:100%!important" width="100%" height="100%">
                  <tbody><tr>
                    <td valign="top" style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:15px;color:#23496d;word-break:break-word">
                      <div id="m_-219893587248066579hs_cos_wrapper_main" style="color:inherit;font-size:inherit;line-height:inherit">  <div id="m_-219893587248066579section-0" class="m_-219893587248066579hse-section" style="padding-left:10px;padding-right:10px;padding-top:20px">
              
              
              
                <div class="m_-219893587248066579hse-column-container" style="min-width:280px;max-width:600px;width:100%;Margin-left:auto;Margin-right:auto;border-collapse:collapse;border-spacing:0;background-color:#ffffff" bgcolor="#ffffff">
              
              
              
              

          <div id="m_-219893587248066579column-0-1" class="m_-219893587248066579hse-column m_-219893587248066579hse-size-12">
            <div id="m_-219893587248066579hs_cos_wrapper_module_16075375198592" style="color:inherit;font-size:inherit;line-height:inherit">
            
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-spacing:0!important;border-collapse:collapse">
              <tbody>
                  <tr>
                      <td align="center" valign="top" style="border-collapse:collapse;font-family:Arial,sans-serif;color:#23496d;word-break:break-word;text-align:center;padding:10px 20px;font-size:0px">
                          
                          <img alt="header-email-indicaê" src="https://ci6.googleusercontent.com/proxy/v48OVLTOXOogw-crvXmujb2lqxE-TvHgfv9zEGI0O2-BxE3JCk_SEQnCUVXbB8r8lX1V9lyogswbCIrp6OogEK2bWzy5AlGBY2IqJe8YW1YuewlDbHUzYPotODYeX4x08up0RKkKZdWHCJn63SDeG4wxzm-bz2vXrErGA-OhuA1UanPMK0uBiN-z7oqJs6jn2pJuygTdM1j6QVKbcGIy-V6iHBtZEw=s0-d-e1-ft#https://hs-7112881.f.hubspotemail.net/hub/7112881/hubfs/header-email-indicae%CC%82.png?width=1120&amp;upscale=true&amp;name=header-email-indicae%CC%82.png" style="outline:none;text-decoration:none;max-width:100%;font-size:16px" width="560" align="middle" class="CToWUd">
                          
                      </td>
                  </tr>
              </tbody>
          </table>
          </div>
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-spacing:0!important;border-collapse:collapse"><tbody><tr><td class="m_-219893587248066579hs_padded" style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:15px;color:#23496d;word-break:break-word;padding:10px 20px"><div id="m_-219893587248066579hs_cos_wrapper_module_16075375312833" style="color:inherit;font-size:inherit;line-height:inherit"><div id="m_-219893587248066579hs_cos_wrapper_module_16075375312833_" style="color:inherit;font-size:inherit;line-height:inherit"><p style="font-size:22px;line-height:150%;text-align:center" align="center"><strong>Recuperação de senha&nbsp;</strong></p></div></div></td></tr></tbody></table>
          <div id="m_-219893587248066579hs_cos_wrapper_module_160821938862919" style="color:inherit;font-size:inherit;line-height:inherit">
            
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-spacing:0!important;border-collapse:collapse">
              <tbody>
                  <tr>
                      <td align="center" valign="top" style="border-collapse:collapse;font-family:Arial,sans-serif;color:#23496d;word-break:break-word;text-align:center;padding:10px 20px;font-size:0px">
                          
                          <img alt="banner-email-senha" src="https://ci4.googleusercontent.com/proxy/7RkdSUlY-dGZ8luUeR0qpYsNAGLdh7jFqjXe5sGNEDv3xUrCZxsu1V4fIWWuAY9HCFpeVXgjKuPqi_zgWtOlLQL0x8MnCJXIKcpAg_52e206UZg-EXG37f1Plk_FqB7ki1xDv5nuezdNFSTYJO-3blPcon2jvN_yCtCOb8UcIJFhfmugvjurEukbciy6UGy7IfhLsAwm=s0-d-e1-ft#https://hs-7112881.f.hubspotemail.net/hub/7112881/hubfs/banner-email-senha.png?width=1120&amp;upscale=true&amp;name=banner-email-senha.png" style="outline:none;text-decoration:none;max-width:100%;font-size:16px" width="560" align="middle" class="CToWUd a6T" tabindex="0"><div class="a6S" dir="ltr" style="opacity: 1; left: 792px; top: 322.4px;"><div id=":nf" class="T-I J-J5-Ji aQv T-I-ax7 L3 a5q" role="button" tabindex="0" aria-label="Fazer o download do anexo " data-tooltip-class="a1V" data-tooltip="Fazer o download"><div class="akn"><div class="aSK J-J5-Ji aYr"></div></div></div></div>
                          
                      </td>
                  </tr>
              </tbody>
          </table>
          </div>
          </div>


              
              </div>
            
            </div>
            <div id="m_-219893587248066579section_1610137974527" class="m_-219893587248066579hse-section" style="padding-left:10px;padding-right:10px">
              
              
              
                <div class="m_-219893587248066579hse-column-container" style="min-width:280px;max-width:600px;width:100%;Margin-left:auto;Margin-right:auto;border-collapse:collapse;border-spacing:0;background-color:#ffffff" bgcolor="#ffffff">
              
              
              
              

          <div id="m_-219893587248066579column_1610137974528_0" class="m_-219893587248066579hse-column m_-219893587248066579hse-size-12">
            <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-spacing:0!important;border-collapse:collapse"><tbody><tr><td class="m_-219893587248066579hs_padded" style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:15px;color:#23496d;word-break:break-word;padding:10px 20px"><div id="m_-219893587248066579hs_cos_wrapper_module_16101379887913" style="color:inherit;font-size:inherit;line-height:inherit"><div id="m_-219893587248066579hs_cos_wrapper_module_16101379887913_" style="color:inherit;font-size:inherit;line-height:inherit"><p style="line-height:175%"><span style="color:#738096">Olá${
              ', ' + data.username || ''
            }!&nbsp;</span></p>
          <p style="line-height:175%">&nbsp;</p>
          <p style="line-height:175%"><span style="color:#738096">Sua senha foi alterada com sucesso!</span></p></div></div></td></tr></tbody></table>
          </div>


              
              </div>
            
            </div>
            <div id="m_-219893587248066579section_1610138015341" class="m_-219893587248066579hse-section" style="padding-left:10px;padding-right:10px">
              
              
              
                <div class="m_-219893587248066579hse-column-container" style="min-width:280px;max-width:600px;width:100%;Margin-left:auto;Margin-right:auto;border-collapse:collapse;border-spacing:0;background-color:#ffffff" bgcolor="#ffffff">
              
              
              
              

          <div id="m_-219893587248066579column_1610138015341_0" class="m_-219893587248066579hse-column m_-219893587248066579hse-size-12">
            <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-spacing:0!important;border-collapse:collapse"><tbody><tr><td class="m_-219893587248066579hs_padded" style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:15px;color:#23496d;word-break:break-word;padding:19px 20px 10px 18px"><div id="m_-219893587248066579hs_cos_wrapper_module_160821926267616" style="color:inherit;font-size:inherit;line-height:inherit">
            
          </div></td></tr></tbody></table>
          </div>


              
              </div>
            
            </div><span class="im">
            <div id="m_-219893587248066579section-1" class="m_-219893587248066579hse-section" style="padding-left:10px;padding-right:10px;padding-bottom:20px">
              
              
              
                <div class="m_-219893587248066579hse-column-container" style="min-width:280px;max-width:600px;width:100%;Margin-left:auto;Margin-right:auto;border-collapse:collapse;border-spacing:0">
              
              
              
              

          <div id="m_-219893587248066579column-1-1" class="m_-219893587248066579hse-column m_-219893587248066579hse-size-12">
            <div id="m_-219893587248066579hs_cos_wrapper_module_160821833507510" style="color:inherit;font-size:inherit;line-height:inherit">
            
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-spacing:0!important;border-collapse:collapse">
              <tbody>
                  <tr>
                      <td align="center" valign="top" style="border-collapse:collapse;font-family:Arial,sans-serif;color:#23496d;word-break:break-word;text-align:center;padding:0px 20px;font-size:0px">
                          
                          <img alt="footer-2 (1)" src="https://ci4.googleusercontent.com/proxy/Jgc5jYutFAhzj_yYWtfKOVQ1RGpJCXk1fU0odc59bPLPdHer5JOWM-UdTLJdWelw3P2PgLOJo83FFItfncDvFwQvrmBB_BKpcr7cx6o4cGfGd1QxgV2aGST22LUCvR3QWVkXH8hrnONckCpHjVUjLY25Y_snIBzJKmyr2DSC4gM48HXdMNvDJ18vId0e=s0-d-e1-ft#https://hs-7112881.f.hubspotemail.net/hub/7112881/hubfs/footer-2%20(1).png?width=1120&amp;upscale=true&amp;name=footer-2%20(1).png" style="outline:none;text-decoration:none;max-width:100%;font-size:16px" width="560" align="middle" class="CToWUd a6T" tabindex="0"><div class="a6S" dir="ltr" style="opacity: 0.01;"><div id=":ng" class="T-I J-J5-Ji aQv T-I-ax7 L3 a5q" title="Fazer o download" role="button" tabindex="0" aria-label="Fazer o download do anexo " data-tooltip-class="a1V"><div class="akn"><div class="aSK J-J5-Ji aYr"></div></div></div></div>
                          
                      </td>
                  </tr>
              </tbody>
          </table>
          </div>
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-spacing:0!important;border-collapse:collapse"><tbody><tr><td class="m_-219893587248066579hs_padded" style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:15px;color:#23496d;word-break:break-word;padding:0px 20px"><div id="m_-219893587248066579hs_cos_wrapper_module-1-1-1" style="color:inherit;font-size:inherit;line-height:inherit">
            
            
            
            
            
            
            

          </div></td></tr></tbody></table>
          </div>


              
              </div>
            
            </div>
          </span></div>
                    </td>
                  </tr>
                </tbody></table>
              </div>
            
          <img src="https://ci5.googleusercontent.com/proxy/MMOJJYbTl2OvNVGKMY2lISV2v0trRwW1ZnnxZ7oo5h83mM77McmVxWuC7zGUdmgEAP4ZLAukFNx4wjPV8WJhi83kxyKCkqn7lGTWAzpWS8yfbUF7lEB1eSYOcIz11gAa1GyNyYEj=s0-d-e1-ft#https://i7.t.hubspotemail.net/e2t/to/VVxwQ_1CkCffW2W_Jbq4Y_mFzVJvnzy4lLJ2Kf4lQrtr22" alt="" width="1" height="1" border="0" style="display:none!important;min-height:1px!important;width:1px!important;border-width:0!important;margin-top:0!important;margin-bottom:0!important;margin-right:0!important;margin-left:0!important;padding-top:0!important;padding-bottom:0!important;padding-right:0!important;padding-left:0!important" class="CToWUd"></div>
                 
        </body>
      </html>
      
           `,
    })
  } catch (e) {
    throw new Error(e.message)
  }
}

const sendInviteUserMail = async (data: ISendInviteUserMail) => {
  if (process.env.NODE_ENV === 'test') return

  try {
    await Mail.sendMail({
      from: 'Loja Integrada No-reply <noreply@plugone.io>',
      to: `<${data.email}>`,
      subject: 'Programa de Afiliados Indicaê da Loja Integrada',
      html: `

<!DOCTYPE html>
<html lang="pt-BR" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="x-ua-compatible" content="ie=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="x-apple-disable-message-reformatting"
    <title></title>
    <!--[if mso]>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </head>
  <body>
    
<div bgcolor="#ffffff" style="margin:0!important;padding:0!important;font-family:Arial,sans-serif;font-size:15px;color:#23496d;word-break:break-word"><span class="im">
    
<div id="m_8418518412346584295preview_text" style="display:none!important;font-size:1px;color:#ffffff;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden">A Newsletter de Parceiros é mensal e traz as novidades dos parceiros de Temas, Serviços e Agências da Loja Integrada! Fique por dentro!</div>
    

    </span><div style="background-color:#ffffff" bgcolor="#ffffff">
      <table role="presentation" cellpadding="0" cellspacing="0" style="border-spacing:0!important;border-collapse:collapse;margin:0;padding:0;width:100%!important;min-width:320px!important;height:100%!important" width="100%" height="100%">
        <tbody><tr>
          <td valign="top" style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:15px;color:#23496d;word-break:break-word">
            <div id="m_8418518412346584295hs_cos_wrapper_main" style="color:inherit;font-size:inherit;line-height:inherit">  <div id="m_8418518412346584295section-0" class="m_8418518412346584295hse-section" style="padding-left:10px;padding-right:10px;padding-top:20px">
    
    
    
      <div class="m_8418518412346584295hse-column-container" style="min-width:280px;max-width:600px;width:100%;Margin-left:auto;Margin-right:auto;border-collapse:collapse;border-spacing:0;background-color:#ffffff" bgcolor="#ffffff">
    
    
    
    

<div id="m_8418518412346584295column-0-1" class="m_8418518412346584295hse-column m_8418518412346584295hse-size-12">
  <div id="m_8418518412346584295hs_cos_wrapper_module_16075375198592" style="color:inherit;font-size:inherit;line-height:inherit">
	
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-spacing:0!important;border-collapse:collapse">
    <tbody>
        <tr>
            <td align="center" valign="top" style="border-collapse:collapse;font-family:Arial,sans-serif;color:#23496d;word-break:break-word;text-align:center;padding:10px 20px;font-size:0px">
                
                <img alt="header-email-indicaê" src="https://ci6.googleusercontent.com/proxy/v48OVLTOXOogw-crvXmujb2lqxE-TvHgfv9zEGI0O2-BxE3JCk_SEQnCUVXbB8r8lX1V9lyogswbCIrp6OogEK2bWzy5AlGBY2IqJe8YW1YuewlDbHUzYPotODYeX4x08up0RKkKZdWHCJn63SDeG4wxzm-bz2vXrErGA-OhuA1UanPMK0uBiN-z7oqJs6jn2pJuygTdM1j6QVKbcGIy-V6iHBtZEw=s0-d-e1-ft#https://hs-7112881.f.hubspotemail.net/hub/7112881/hubfs/header-email-indicae%CC%82.png?width=1120&amp;upscale=true&amp;name=header-email-indicae%CC%82.png" style="outline:none;text-decoration:none;max-width:100%;font-size:16px" width="560" align="middle" class="CToWUd">
                
            </td>
        </tr>
    </tbody>
</table>
</div>
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-spacing:0!important;border-collapse:collapse"><tbody><tr><td class="m_8418518412346584295hs_padded" style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:15px;color:#23496d;word-break:break-word;padding:10px 20px"><div id="m_8418518412346584295hs_cos_wrapper_module_16075375312833" style="color:inherit;font-size:inherit;line-height:inherit"><div id="m_8418518412346584295hs_cos_wrapper_module_16075375312833_" style="color:inherit;font-size:inherit;line-height:inherit"><p style="font-size:22px;line-height:150%;text-align:center" align="center"><strong>Bem vindo ao Programa de Indicações </strong></p>
<p style="font-size:22px;line-height:150%;text-align:center" align="center"><strong>da Loja Integrada!&nbsp;&nbsp;</strong></p></div></div></td></tr></tbody></table>
<div id="m_8418518412346584295hs_cos_wrapper_module_160821938862919" style="color:inherit;font-size:inherit;line-height:inherit">
	
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-spacing:0!important;border-collapse:collapse">
    <tbody>
        <tr>
            <td align="center" valign="top" style="border-collapse:collapse;font-family:Arial,sans-serif;color:#23496d;word-break:break-word;text-align:center;padding:10px 20px;font-size:0px">
                
                <img alt="banner-email-Convite-pro-Afiliado" src="https://ci6.googleusercontent.com/proxy/Ydfo5sLf9NzbC5NAXJnaHoNZB3po7FRH0xWbyv5ZECG0IX0CZ2l7L8Ns_QTzz__ge6Ivx25DycbHbLZUdYQyLL_Deldbwi_EsgghbouzwdLgk75jTAdyaY7fWhmIycjDtF7QvLSfnIOLbuc4RWefUZq1taolKcWnKwJ8eBXdXCUfrtd_ooAWNzTOy0p0cT0JePeY73ngv6xGdWVBr4AHgdq16ZhxI2uQhKIckq9CSsU-X-46=s0-d-e1-ft#https://hs-7112881.f.hubspotemail.net/hub/7112881/hubfs/banner-email-Convite-pro-Afiliado.png?width=1120&amp;upscale=true&amp;name=banner-email-Convite-pro-Afiliado.png" style="outline:none;text-decoration:none;max-width:100%;font-size:16px" width="560" align="middle" class="CToWUd a6T" tabindex="0"><div class="a6S" dir="ltr" style="opacity: 1; left: 792px; top: 355.2px;"><div id=":o0" class="T-I J-J5-Ji aQv T-I-ax7 L3 a5q" role="button" tabindex="0" aria-label="Fazer o download do anexo " data-tooltip-class="a1V" data-tooltip="Fazer o download"><div class="akn"><div class="aSK J-J5-Ji aYr"></div></div></div></div>
                
            </td>
        </tr>
    </tbody>
</table>
</div>
</div>


    
    </div>
   
  </div>
  <div id="m_8418518412346584295section_1610137974527" class="m_8418518412346584295hse-section" style="padding-left:10px;padding-right:10px">
    
    
    
      <div class="m_8418518412346584295hse-column-container" style="min-width:280px;max-width:600px;width:100%;Margin-left:auto;Margin-right:auto;border-collapse:collapse;border-spacing:0;background-color:#ffffff" bgcolor="#ffffff">
    
    
    
    

<div id="m_8418518412346584295column_1610137974528_0" class="m_8418518412346584295hse-column m_8418518412346584295hse-size-12">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-spacing:0!important;border-collapse:collapse"><tbody><tr><td class="m_8418518412346584295hs_padded" style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:15px;color:#23496d;word-break:break-word;padding:10px 20px"><div id="m_8418518412346584295hs_cos_wrapper_module_16101379887913" style="color:inherit;font-size:inherit;line-height:inherit"><div id="m_8418518412346584295hs_cos_wrapper_module_16101379887913_" style="color:inherit;font-size:inherit;line-height:inherit"><p style="line-height:175%"><span style="color:#738096">Olá!&nbsp;</span></p>
<p style="line-height:175%">&nbsp;</p>
<p style="line-height:175%"><span style="color:#738096">Seja bem-vindo ao Programa de Indicação da Loja Integrada, via nosso parceiro de tecnologia Plugone.&nbsp;</span></p>
<p style="line-height:175%">&nbsp;</p>
<p style="line-height:175%"><span style="color:#738096">Você recebeu o convite para participar do Programa de Indicação da Loja Integrada. Clique abaixo para aceitar. </span></p></div></div></td></tr></tbody></table>
</div>


    
    </div>
   
  </div>
  <div id="m_8418518412346584295section_1610138015341" class="m_8418518412346584295hse-section" style="padding-left:10px;padding-right:10px">
    
    
    
      <div class="m_8418518412346584295hse-column-container" style="min-width:280px;max-width:600px;width:100%;Margin-left:auto;Margin-right:auto;border-collapse:collapse;border-spacing:0;background-color:#ffffff" bgcolor="#ffffff">
    
    
    
    

<div id="m_8418518412346584295column_1610138015341_0" class="m_8418518412346584295hse-column m_8418518412346584295hse-size-12">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-spacing:0!important;border-collapse:collapse"><tbody><tr><td class="m_8418518412346584295hs_padded" style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:15px;color:#23496d;word-break:break-word;padding:19px 20px 10px 18px"><div id="m_8418518412346584295hs_cos_wrapper_module_160821926267616" style="color:inherit;font-size:inherit;line-height:inherit">
  
  <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-spacing:0!important;border-collapse:separate!important">
    <tbody><tr>
        
    
      <td align="center" valign="middle" bgcolor="#42C0C4" role="presentation" style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:15px;color:#23496d;word-break:break-word;border-radius:5px;background-color:#42c0c4">
   
        <a href="${frontUrl}/member-invited/${data.hashToVerify}/accept" style="font-size:16px;font-family:Arial,sans-serif;color:#ffffff;font-weight:normal;text-decoration:none;font-style:normal;Margin:0;text-transform:none;padding:12px 18px;display:block">
          Aceitar convite
        </a>
      </td>
    </tr>
  </tbody></table>
</div></td></tr></tbody></table>
</div>


    
    </div>
   
  </div><span class="im">
  <div id="m_8418518412346584295section-1" class="m_8418518412346584295hse-section" style="padding-left:10px;padding-right:10px;padding-bottom:20px">
    
    
    
      <div class="m_8418518412346584295hse-column-container" style="min-width:280px;max-width:600px;width:100%;Margin-left:auto;Margin-right:auto;border-collapse:collapse;border-spacing:0">
    
    
    
    

<div id="m_8418518412346584295column-1-1" class="m_8418518412346584295hse-column m_8418518412346584295hse-size-12">
  <div id="m_8418518412346584295hs_cos_wrapper_module_160821833507510" style="color:inherit;font-size:inherit;line-height:inherit">
	
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-spacing:0!important;border-collapse:collapse">
    <tbody>
        <tr>
            <td align="center" valign="top" style="border-collapse:collapse;font-family:Arial,sans-serif;color:#23496d;word-break:break-word;text-align:center;padding:0px 20px;font-size:0px">
                
                <img alt="footer-2 (1)" src="https://ci4.googleusercontent.com/proxy/Jgc5jYutFAhzj_yYWtfKOVQ1RGpJCXk1fU0odc59bPLPdHer5JOWM-UdTLJdWelw3P2PgLOJo83FFItfncDvFwQvrmBB_BKpcr7cx6o4cGfGd1QxgV2aGST22LUCvR3QWVkXH8hrnONckCpHjVUjLY25Y_snIBzJKmyr2DSC4gM48HXdMNvDJ18vId0e=s0-d-e1-ft#https://hs-7112881.f.hubspotemail.net/hub/7112881/hubfs/footer-2%20(1).png?width=1120&amp;upscale=true&amp;name=footer-2%20(1).png" style="outline:none;text-decoration:none;max-width:100%;font-size:16px" width="560" align="middle" class="CToWUd a6T" tabindex="0"><div class="a6S" dir="ltr" style="opacity: 0.01;"><div id=":o1" class="T-I J-J5-Ji aQv T-I-ax7 L3 a5q" title="Fazer o download" role="button" tabindex="0" aria-label="Fazer o download do anexo " data-tooltip-class="a1V"><div class="akn"><div class="aSK J-J5-Ji aYr"></div></div></div></div>
                
            </td>
        </tr>
    </tbody>
</table>
</div>
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-spacing:0!important;border-collapse:collapse"><tbody><tr><td class="m_8418518412346584295hs_padded" style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:15px;color:#23496d;word-break:break-word;padding:0px 20px"><div id="m_8418518412346584295hs_cos_wrapper_module-1-1-1" style="color:inherit;font-size:inherit;line-height:inherit">

</div></td></tr></tbody></table>
</div>


    
    </div>
   
  </div>
</span></div>
          </td>
        </tr>
      </tbody></table>
    </div>
  
<img src="https://ci3.googleusercontent.com/proxy/KLZcA37Ruhj2SGQultN0JtPY7JUxlovwGDGLjG5Fc_zyM5U2xP5PgqFAgxJkuRLmMRas-XsWLzbXYJhzCmKQKDz31zoAENRAVgaIVnYVAJ49qNCE8C5DNxA-ZgiMXKxU1NcN3mH4YA=s0-d-e1-ft#https://i7.t.hubspotemail.net/e2t/to/VW9rW315v05wW4qdSHr8JW_bqW5_BCzp4lLJjvf9k7LYD22" alt="" width="1" height="1" border="0" style="display:none!important;min-height:1px!important;width:1px!important;border-width:0!important;margin-top:0!important;margin-bottom:0!important;margin-right:0!important;margin-left:0!important;padding-top:0!important;padding-bottom:0!important;padding-right:0!important;padding-left:0!important" class="CToWUd"></div>
  </body>
</html>
                `,
    })
  } catch (e) {
    throw new Error(e.message)
  }
}

const sendInviteNewUserMail = async (data: ISendInviteUserMail) => {
  if (process.env.NODE_ENV === 'test') return

  try {
    await Mail.sendMail({
      from: 'PlugOne No-reply <noreply@plugone.io>',
      to: `<${data.email}>`,
      subject: 'Programa de Afiliados Indicaê da Loja Integrada',
      html: `

      <!DOCTYPE html>
      <html lang="pt-BR" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
        <head>
          <meta charset="utf-8">
          <meta http-equiv="x-ua-compatible" content="ie=edge">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <meta name="x-apple-disable-message-reformatting"
          <title></title>
          <!--[if mso]>
          <xml>
            <o:OfficeDocumentSettings>
              <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
          </xml>
        </head>
        <body>
          
      <div bgcolor="#ffffff" style="margin:0!important;padding:0!important;font-family:Arial,sans-serif;font-size:15px;color:#23496d;word-break:break-word"><span class="im">
          
      <div id="m_8418518412346584295preview_text" style="display:none!important;font-size:1px;color:#ffffff;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden">A Newsletter de Parceiros é mensal e traz as novidades dos parceiros de Temas, Serviços e Agências da Loja Integrada! Fique por dentro!</div>
          
      
          </span><div style="background-color:#ffffff" bgcolor="#ffffff">
            <table role="presentation" cellpadding="0" cellspacing="0" style="border-spacing:0!important;border-collapse:collapse;margin:0;padding:0;width:100%!important;min-width:320px!important;height:100%!important" width="100%" height="100%">
              <tbody><tr>
                <td valign="top" style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:15px;color:#23496d;word-break:break-word">
                  <div id="m_8418518412346584295hs_cos_wrapper_main" style="color:inherit;font-size:inherit;line-height:inherit">  <div id="m_8418518412346584295section-0" class="m_8418518412346584295hse-section" style="padding-left:10px;padding-right:10px;padding-top:20px">
          
          
          
            <div class="m_8418518412346584295hse-column-container" style="min-width:280px;max-width:600px;width:100%;Margin-left:auto;Margin-right:auto;border-collapse:collapse;border-spacing:0;background-color:#ffffff" bgcolor="#ffffff">
          
          
          
          
      
      <div id="m_8418518412346584295column-0-1" class="m_8418518412346584295hse-column m_8418518412346584295hse-size-12">
        <div id="m_8418518412346584295hs_cos_wrapper_module_16075375198592" style="color:inherit;font-size:inherit;line-height:inherit">
        
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-spacing:0!important;border-collapse:collapse">
          <tbody>
              <tr>
                  <td align="center" valign="top" style="border-collapse:collapse;font-family:Arial,sans-serif;color:#23496d;word-break:break-word;text-align:center;padding:10px 20px;font-size:0px">
                      
                      <img alt="header-email-indicaê" src="https://ci6.googleusercontent.com/proxy/v48OVLTOXOogw-crvXmujb2lqxE-TvHgfv9zEGI0O2-BxE3JCk_SEQnCUVXbB8r8lX1V9lyogswbCIrp6OogEK2bWzy5AlGBY2IqJe8YW1YuewlDbHUzYPotODYeX4x08up0RKkKZdWHCJn63SDeG4wxzm-bz2vXrErGA-OhuA1UanPMK0uBiN-z7oqJs6jn2pJuygTdM1j6QVKbcGIy-V6iHBtZEw=s0-d-e1-ft#https://hs-7112881.f.hubspotemail.net/hub/7112881/hubfs/header-email-indicae%CC%82.png?width=1120&amp;upscale=true&amp;name=header-email-indicae%CC%82.png" style="outline:none;text-decoration:none;max-width:100%;font-size:16px" width="560" align="middle" class="CToWUd">
                      
                  </td>
              </tr>
          </tbody>
      </table>
      </div>
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-spacing:0!important;border-collapse:collapse"><tbody><tr><td class="m_8418518412346584295hs_padded" style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:15px;color:#23496d;word-break:break-word;padding:10px 20px"><div id="m_8418518412346584295hs_cos_wrapper_module_16075375312833" style="color:inherit;font-size:inherit;line-height:inherit"><div id="m_8418518412346584295hs_cos_wrapper_module_16075375312833_" style="color:inherit;font-size:inherit;line-height:inherit"><p style="font-size:22px;line-height:150%;text-align:center" align="center"><strong>Bem vindo ao Programa de Indicações </strong></p>
      <p style="font-size:22px;line-height:150%;text-align:center" align="center"><strong>da Loja Integrada!&nbsp;&nbsp;</strong></p></div></div></td></tr></tbody></table>
      <div id="m_8418518412346584295hs_cos_wrapper_module_160821938862919" style="color:inherit;font-size:inherit;line-height:inherit">
        
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-spacing:0!important;border-collapse:collapse">
          <tbody>
              <tr>
                  <td align="center" valign="top" style="border-collapse:collapse;font-family:Arial,sans-serif;color:#23496d;word-break:break-word;text-align:center;padding:10px 20px;font-size:0px">
                      
                      <img alt="banner-email-Convite-pro-Afiliado" src="https://ci6.googleusercontent.com/proxy/Ydfo5sLf9NzbC5NAXJnaHoNZB3po7FRH0xWbyv5ZECG0IX0CZ2l7L8Ns_QTzz__ge6Ivx25DycbHbLZUdYQyLL_Deldbwi_EsgghbouzwdLgk75jTAdyaY7fWhmIycjDtF7QvLSfnIOLbuc4RWefUZq1taolKcWnKwJ8eBXdXCUfrtd_ooAWNzTOy0p0cT0JePeY73ngv6xGdWVBr4AHgdq16ZhxI2uQhKIckq9CSsU-X-46=s0-d-e1-ft#https://hs-7112881.f.hubspotemail.net/hub/7112881/hubfs/banner-email-Convite-pro-Afiliado.png?width=1120&amp;upscale=true&amp;name=banner-email-Convite-pro-Afiliado.png" style="outline:none;text-decoration:none;max-width:100%;font-size:16px" width="560" align="middle" class="CToWUd a6T" tabindex="0"><div class="a6S" dir="ltr" style="opacity: 1; left: 792px; top: 355.2px;"><div id=":o0" class="T-I J-J5-Ji aQv T-I-ax7 L3 a5q" role="button" tabindex="0" aria-label="Fazer o download do anexo " data-tooltip-class="a1V" data-tooltip="Fazer o download"><div class="akn"><div class="aSK J-J5-Ji aYr"></div></div></div></div>
                      
                  </td>
              </tr>
          </tbody>
      </table>
      </div>
      </div>
      
      
          
          </div>
         
        </div>
        <div id="m_8418518412346584295section_1610137974527" class="m_8418518412346584295hse-section" style="padding-left:10px;padding-right:10px">
          
          
          
            <div class="m_8418518412346584295hse-column-container" style="min-width:280px;max-width:600px;width:100%;Margin-left:auto;Margin-right:auto;border-collapse:collapse;border-spacing:0;background-color:#ffffff" bgcolor="#ffffff">
          
          
          
          
      
      <div id="m_8418518412346584295column_1610137974528_0" class="m_8418518412346584295hse-column m_8418518412346584295hse-size-12">
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-spacing:0!important;border-collapse:collapse"><tbody><tr><td class="m_8418518412346584295hs_padded" style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:15px;color:#23496d;word-break:break-word;padding:10px 20px"><div id="m_8418518412346584295hs_cos_wrapper_module_16101379887913" style="color:inherit;font-size:inherit;line-height:inherit"><div id="m_8418518412346584295hs_cos_wrapper_module_16101379887913_" style="color:inherit;font-size:inherit;line-height:inherit"><p style="line-height:175%"><span style="color:#738096">Olá!&nbsp;</span></p>
      <p style="line-height:175%">&nbsp;</p>
      <p style="line-height:175%"><span style="color:#738096">Seja bem-vindo ao Programa de Indicação da Loja Integrada, via nosso parceiro de tecnologia Plugone.&nbsp;</span></p>
      <p style="line-height:175%">&nbsp;</p>
      <p style="line-height:175%"><span style="color:#738096">Você recebeu o convite para participar do Programa de Indicação da Loja Integrada. Clique abaixo para aceitar. </span></p></div></div></td></tr></tbody></table>
      </div>
      
      
          
          </div>
         
        </div>
        <div id="m_8418518412346584295section_1610138015341" class="m_8418518412346584295hse-section" style="padding-left:10px;padding-right:10px">
          
          
          
            <div class="m_8418518412346584295hse-column-container" style="min-width:280px;max-width:600px;width:100%;Margin-left:auto;Margin-right:auto;border-collapse:collapse;border-spacing:0;background-color:#ffffff" bgcolor="#ffffff">
          
          
          
          
      
      <div id="m_8418518412346584295column_1610138015341_0" class="m_8418518412346584295hse-column m_8418518412346584295hse-size-12">
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-spacing:0!important;border-collapse:collapse"><tbody><tr><td class="m_8418518412346584295hs_padded" style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:15px;color:#23496d;word-break:break-word;padding:19px 20px 10px 18px"><div id="m_8418518412346584295hs_cos_wrapper_module_160821926267616" style="color:inherit;font-size:inherit;line-height:inherit">
        
        <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-spacing:0!important;border-collapse:separate!important">
          <tbody><tr>
              
          
            <td align="center" valign="middle" bgcolor="#42C0C4" role="presentation" style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:15px;color:#23496d;word-break:break-word;border-radius:5px;background-color:#42c0c4">
         
              <a href="${frontUrl}/member-invited/${data.hashToVerify}/accept" style="font-size:16px;font-family:Arial,sans-serif;color:#ffffff;font-weight:normal;text-decoration:none;font-style:normal;Margin:0;text-transform:none;padding:12px 18px;display:block">
                Aceitar convite
              </a>
            </td>
          </tr>
        </tbody></table>
      </div></td></tr></tbody></table>
      </div>
      
      
          
          </div>
         
        </div><span class="im">
        <div id="m_8418518412346584295section-1" class="m_8418518412346584295hse-section" style="padding-left:10px;padding-right:10px;padding-bottom:20px">
          
          
          
            <div class="m_8418518412346584295hse-column-container" style="min-width:280px;max-width:600px;width:100%;Margin-left:auto;Margin-right:auto;border-collapse:collapse;border-spacing:0">
          
          
          
          
      
      <div id="m_8418518412346584295column-1-1" class="m_8418518412346584295hse-column m_8418518412346584295hse-size-12">
        <div id="m_8418518412346584295hs_cos_wrapper_module_160821833507510" style="color:inherit;font-size:inherit;line-height:inherit">
        
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-spacing:0!important;border-collapse:collapse">
          <tbody>
              <tr>
                  <td align="center" valign="top" style="border-collapse:collapse;font-family:Arial,sans-serif;color:#23496d;word-break:break-word;text-align:center;padding:0px 20px;font-size:0px">
                      
                      <img alt="footer-2 (1)" src="https://ci4.googleusercontent.com/proxy/Jgc5jYutFAhzj_yYWtfKOVQ1RGpJCXk1fU0odc59bPLPdHer5JOWM-UdTLJdWelw3P2PgLOJo83FFItfncDvFwQvrmBB_BKpcr7cx6o4cGfGd1QxgV2aGST22LUCvR3QWVkXH8hrnONckCpHjVUjLY25Y_snIBzJKmyr2DSC4gM48HXdMNvDJ18vId0e=s0-d-e1-ft#https://hs-7112881.f.hubspotemail.net/hub/7112881/hubfs/footer-2%20(1).png?width=1120&amp;upscale=true&amp;name=footer-2%20(1).png" style="outline:none;text-decoration:none;max-width:100%;font-size:16px" width="560" align="middle" class="CToWUd a6T" tabindex="0"><div class="a6S" dir="ltr" style="opacity: 0.01;"><div id=":o1" class="T-I J-J5-Ji aQv T-I-ax7 L3 a5q" title="Fazer o download" role="button" tabindex="0" aria-label="Fazer o download do anexo " data-tooltip-class="a1V"><div class="akn"><div class="aSK J-J5-Ji aYr"></div></div></div></div>
                      
                  </td>
              </tr>
          </tbody>
      </table>
      </div>
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-spacing:0!important;border-collapse:collapse"><tbody><tr><td class="m_8418518412346584295hs_padded" style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:15px;color:#23496d;word-break:break-word;padding:0px 20px"><div id="m_8418518412346584295hs_cos_wrapper_module-1-1-1" style="color:inherit;font-size:inherit;line-height:inherit">
      
      </div></td></tr></tbody></table>
      </div>
      
      
          
          </div>
         
        </div>
      </span></div>
                </td>
              </tr>
            </tbody></table>
          </div>
        
      <img src="https://ci3.googleusercontent.com/proxy/KLZcA37Ruhj2SGQultN0JtPY7JUxlovwGDGLjG5Fc_zyM5U2xP5PgqFAgxJkuRLmMRas-XsWLzbXYJhzCmKQKDz31zoAENRAVgaIVnYVAJ49qNCE8C5DNxA-ZgiMXKxU1NcN3mH4YA=s0-d-e1-ft#https://i7.t.hubspotemail.net/e2t/to/VW9rW315v05wW4qdSHr8JW_bqW5_BCzp4lLJjvf9k7LYD22" alt="" width="1" height="1" border="0" style="display:none!important;min-height:1px!important;width:1px!important;border-width:0!important;margin-top:0!important;margin-bottom:0!important;margin-right:0!important;margin-left:0!important;padding-top:0!important;padding-bottom:0!important;padding-right:0!important;padding-left:0!important" class="CToWUd"></div>
        </body>
      </html>
                      `,
    })
  } catch (e) {
    throw new Error(e.message)
  }
}

export default {
  sendSignUpMail,
  sendRecoveryPasswordMail,
  sendRecoveredPasswordMail,
  sendInviteUserMail,
  sendInviteNewUserMail,
}
