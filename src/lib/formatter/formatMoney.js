const formatMoney = (amount) => {
  return new Intl.NumberFormat("ko-KR").format(amount);
};

export default formatMoney;
