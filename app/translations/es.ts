// es.ts
export const es = {
    common: {
      languages: {
        en: 'Inglés',
        es: 'Español',
        fr: 'Francés'
      },
      back: 'Volver'
    },
    landing: {
      hero: {
        title: 'Plataforma de servicio al cliente de última generación',
        subtitle: 'Empodere a su equipo de soporte con soluciones impulsadas por IA',
        getStarted: 'Empezar',
        learnMore: 'Más información'
      },
      features: {
        title: 'Características',
        aiAssistant: {
          title: 'Asistente de IA',
          description: 'Automatización inteligente para resoluciones más rápidas'
        },
        ticketing: {
          title: 'Tickets inteligentes',
          description: 'Gestión y enrutamiento de tickets eficiente'
        },
        analytics: {
          title: 'Análisis avanzados',
          description: 'Información basada en datos para mejores decisiones'
        }
      },
      cta: {
        title: '¿Listo para transformar su servicio al cliente?',
        subtitle: 'Únase a miles de empresas que ya utilizan nuestra plataforma',
        button: 'Comience la prueba gratuita'
      }
    },
    faq: {
      title: 'Preguntas frecuentes',
      description: 'Encuentre respuestas a preguntas comunes sobre nuestra plataforma.',
      searchPlaceholder: 'Buscar preguntas...',
      categories: {
        general: 'General',
        pricing: 'Precios',
        technical: 'Soporte técnico'
      },
      technical: {
        title: 'Preguntas frecuentes sobre soporte técnico',
        description: 'Obtenga ayuda con problemas técnicos, solución de problemas y configuración.',
        items: [
          {
            question: "¿Cómo restablezco mi contraseña?",
            answer: "Para restablecer su contraseña, haga clic en el enlace 'Olvidé mi contraseña' en la página de inicio de sesión. Ingrese su dirección de correo electrónico y le enviaremos instrucciones para crear una nueva contraseña. Por razones de seguridad, los enlaces para restablecer la contraseña caducan después de 24 horas."
          },
          {
            question: "¿Qué navegadores y dispositivos son compatibles?",
            answer: "Nuestra plataforma está optimizada para las últimas versiones de los navegadores Chrome, Firefox, Safari y Edge. También admitimos dispositivos móviles con iOS 13+ y Android 8+. Para obtener la mejor experiencia, recomendamos mantener su navegador y sistema operativo actualizados."
          },
          {
            question: "¿Cómo puedo administrar mi configuración de notificaciones?",
            answer: "Inicie sesión en su cuenta y vaya a Configuración> Notificaciones. Aquí puede personalizar sus preferencias para notificaciones por correo electrónico, alertas en la aplicación y notificaciones push móviles. Puede establecer diferentes niveles de notificación para actualizaciones de tickets, menciones y anuncios del sistema."
          },
          {
            question: "¿Qué debo hacer si encuentro un error?",
            answer: "Si encuentra un error: 1) Tome una captura de pantalla del mensaje de error, 2) Anote los pasos que llevaron al error, 3) Borre la caché y las cookies de su navegador, 4) Intente cerrar sesión y volver a iniciarla. Si el problema persiste, comuníquese con nuestro equipo de soporte con estos detalles para una resolución más rápida."
          },
          {
            question: "¿Cómo habilito la autenticación de dos factores (2FA)?",
            answer: "Para habilitar 2FA: 1) Vaya a Configuración> Seguridad, 2) Haga clic en 'Habilitar 2FA', 3) Elija entre la aplicación de autenticación o la verificación por SMS, 4) Siga el asistente de configuración. Recomendamos utilizar una aplicación de autenticación como Google Authenticator o Authy para mejorar la seguridad."
          },
          {
            question: "¿Puedo acceder a la plataforma sin conexión?",
            answer: "Si bien la mayoría de las funciones requieren una conexión a Internet, nuestra aplicación web progresiva (PWA) le permite ver los tickets cargados previamente y redactar respuestas sin conexión. Sus cambios se sincronizarán automáticamente una vez que vuelva a estar en línea."
          },
          {
            question: "¿Cómo exporto mis datos?",
            answer: "Para exportar sus datos: 1) Vaya a Configuración> Administración de datos, 2) Seleccione el tipo de datos que desea exportar (tickets, contactos, informes), 3) Elija su formato preferido (CSV, JSON, PDF), 4) Haga clic en 'Generar exportación'. Las exportaciones grandes pueden tardar varios minutos en procesarse."
          },
          {
            question: "¿Cuáles son los requisitos del sistema?",
            answer: "Requisitos mínimos: 2 GB de RAM, navegador web moderno, conexión a Internet estable (1 Mbps +). Para un rendimiento óptimo, recomendamos: 4 GB + RAM, Internet de alta velocidad (5 Mbps +) y una resolución de pantalla de 1280x720 o superior."
          }
        ]
      }
    },
    contact: {
      title: 'Contactar con soporte',
      form: {
        description: 'Complete el siguiente formulario y nos pondremos en contacto con usted lo antes posible.',
        customerInfo: 'Su información',
        name: 'Nombre completo',
        email: 'Dirección de correo electrónico',
        company: 'Empresa',
        phone: 'Número de teléfono',
        issueDetails: 'Detalles del problema',
        category: 'Categoría',
        categories: {
          support: 'Soporte técnico',
          billing: 'Facturación',
          sales: 'Preguntas sobre el producto',
          account: 'Administración de cuenta',
          other: 'Otro'
        },
        subject: 'Asunto',
        message: 'Mensaje',
        submit: 'Enviar',
        submitting: 'Enviando...'
      },
      success: 'Mensaje enviado con éxito!',
      error: 'Error al enviar el mensaje. Por favor, inténtelo de nuevo.'
    }
  };