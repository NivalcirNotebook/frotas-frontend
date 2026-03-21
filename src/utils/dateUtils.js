export const formatDateBR = (dateString) => {
  if (!dateString) return '';
  
  // Extrair data do formato YYYY-MM-DD (com ou sem hora)
  let datePart = dateString;
  
  // Se tiver hora (T), pegar só a parte da data
  if (dateString.includes('T')) {
    datePart = dateString.split('T')[0];
  }
  
  // Se estiver no formato YYYY-MM-DD
  if (datePart.match(/^\d{4}-\d{2}-\d{2}$/)) {
    const [year, month, day] = datePart.split('-');
    return `${day}/${month}/${year}`;
  }
  
  // Se já estiver formatado (dd/mm/yyyy), retornar como está
  if (datePart.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
    return datePart;
  }
  
  // Fallback: tentar usar Date object
  const date = new Date(dateString);
  if (!isNaN(date.getTime())) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }
  
  return dateString; // Retorna original se não conseguir formatar
};

export const formatDateTimeInput = (dateString) => {
  if (!dateString) {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

export const formatDateTimeLocal = (dateString) => {
  if (!dateString) {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }
  
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};
