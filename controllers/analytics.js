const moment = require("moment");
const { insertMany } = require("../models/Order");

const Order = require("../models/Order");
const errorHandler = require("../utils/errorHendler");

module.exports.overview = async function (req, res) {
  try {
    const allOrders = await Order.find({ user: req.user.id }).sort({ date: 1 });
    const ordersMap = getOrderMap(allOrders);
    const yesterdayOrders =
      ordersMap[moment().add(-1, "d").format("DD.MM.YYYY")] || [];

    // Количество заказов вчера
    const yesterdayOrdersNumber = yesterdayOrders.length;
    // Количество заказов
    const totalOrdersNumber = allOrders.length;
    // Количество дней всего
    const daysNumber = Object.keys(ordersMap).length;
    // Заказов вдень
    const ordersPerDay = (totalOrdersNumber / daysNumber).toFixed(2);
    // Процент количества заказов
    const ordersPercent = ((yesterdayOrders / ordersPerDay - 1) * 100).toFixed(
      2
    );
    // Общая выручка
    const totalGain = calculatePrice(allOrders);
    // Выручка в день
    const gainPerDay = totalGain / daysNumber;
    // Выручка за вчера
    const yesterdayGain = calculatePrice(yesterdayOrders);
    // Процент выручки
    const gainPercent = ((yesterdayGain / gainPerDay - 1) * 100).toFixed(2);
    // Сравнение выручки
    const compareGain = (yesterdayGain - gainPerDay).toFixed(2);
    // Сравнение количества заказов
    const compareNumber = (yesterdayOrdersNumber - ordersPerDay).toFixed(2);

    const ret = {
      gain: {
        percent: Math.abs(+gainPercent),
        compare: Math.abs(+compareGain),
        yesterday: Math.abs(+yesterdayGain),
        isHigher: +gainPercent > 0,
      },
      orders: {
        percent: Math.abs(+ordersPercent),
        compare: Math.abs(+compareNumber),
        yesterday: Math.abs(+yesterdayOrdersNumber),
        isHigher: +ordersPercent > 0,
      },
    };

    console.log(ret);

    res.status(200).json(ret);
  } catch (e) {
    errorHandler(res, e);
  }
};

module.exports.analytics = async function (req, res) {
  try {
    const allOrders = await Order.find({ user: req.user.id }).sort({ date: 1 });
    const ordersMap = getOrderMap(allOrders);

    const average = +(
      calculatePrice(allOrders) / Object.keys(ordersMap).length
    ).toFixed(2);

    const chart = Object.keys(ordersMap).map((label) => {
      const gain = calculatePrice(ordersMap[label]);
      const order = ordersMap[label].length;

      return {
        gain,
        order,
        label,
      };
    });

    res.status(200).json({
      average,
      chart,
    });
  } catch (e) {
    errorHandler(res, e);
  }
};

function getOrderMap(orders = []) {
  const daysOrders = {};

  orders.forEach((order) => {
    const date = moment(order.date).format("DD.MM.YYYY");

    if (date === moment().format("DD.MM.YYYY")) {
      return;
    }

    if (!daysOrders[date]) {
      daysOrders[date] = [];
    }

    daysOrders[date].push(order);
  });

  return daysOrders;
}
function calculatePrice(orders = []) {
  return orders.reduce((total, order) => {
    const orderPrice = order.list.reduce((totalOrder, item) => {
      return (totalOrder += item.cost * item.quantity);
    }, 0);
    return (total += orderPrice);
  }, 0);
}
