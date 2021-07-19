class EventTypeConverter {
  public toString(eventType: string): string {
    if (eventType === '1') {
      return 'Futebol';
    }

    if (eventType === '2') {
      return 'Tênis';
    }

    if (eventType === '27454571') {
      return 'E-Sports';
    }

    if (eventType === '27589895') {
      return 'Jogos Olímpicos';
    }

    if (eventType === '2378961') {
      return 'Política';
    }

    if (eventType === '7522') {
      return 'Basquete';
    }

    if (eventType === '7511') {
      return 'Baseball';
    }

    if (eventType === '10') {
      return 'Apostas especiais';
    }

    if (eventType === '6423') {
      return 'Futebol americano';
    }

    return 'Não definido';
  }
}

export default EventTypeConverter;
