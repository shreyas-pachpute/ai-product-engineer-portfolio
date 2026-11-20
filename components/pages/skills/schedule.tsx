import { ORDERS, SKILLS } from "@/lib/content";
import { MASTS, lineNamed, orderNo, ordersAttr } from "./plan";

const MAST_FOR_GROUP = [MASTS.main.name, MASTS.mizzen.name, MASTS.fore.name];

/**
 * The rigging schedule: the table a drawing carries of every part on it.
 * Here, every skill, where it was used, and the orders that take it, in
 * plain HTML, so all of it can be read without the drawing (or without
 * JavaScript, or by a screen reader). Rows the order in hand takes are
 * marked, by the same stylesheet rule that inks their lines.
 */
export function Schedule() {
  return (
    <section className="sp-schedule" aria-labelledby="sp-schedule-title">
      <header className="sp-schedule__head">
        <h2 id="sp-schedule-title" className="display sp-schedule__title">
          Rigging schedule
        </h2>
        <p className="sp-schedule__sub">
          Every line on the plan: the skill, where it was used, and the orders
          that take it.
        </p>
      </header>
      <table className="sp-table">
        <thead>
          <tr>
            <th scope="col" className="sp-table__no">
              No.
            </th>
            <th scope="col">Skill</th>
            <th scope="col">Where it was used</th>
            <th scope="col" className="sp-table__orders">
              Orders
            </th>
          </tr>
        </thead>
        {SKILLS.map((group, g) => (
          <tbody key={group.name}>
            <tr className="sp-table__group">
              <th colSpan={4} scope="colgroup">
                <span>{MAST_FOR_GROUP[g]}</span> {group.name}
              </th>
            </tr>
            {group.skills.map((skill) => {
              const line = lineNamed(skill.name);
              const orders = ORDERS.flatMap((order, o) =>
                order.skills.includes(skill.name) ? [o] : [],
              );
              return (
                <tr
                  key={skill.name}
                  className="sp-table__row"
                  data-o={ordersAttr(orders)}
                  data-n={line?.n}
                >
                  <td className="sp-table__no">
                    {line ? (
                      <span className="sp-ball">{line.n + 1}</span>
                    ) : null}
                  </td>
                  <th scope="row" className="sp-table__skill">
                    {skill.name}
                    {skill.strong ? (
                      <span className="sp-lead">One I lead with</span>
                    ) : null}
                  </th>
                  <td className="sp-table__evidence">{skill.evidence}</td>
                  <td className="sp-table__orders">
                    <span className="sp-table__k" aria-hidden="true">
                      Orders
                    </span>
                    {orders.length ? (
                      <ul>
                        {orders.map((o) => (
                          <li key={o} title={ORDERS[o]!.order}>
                            <span aria-hidden="true">{orderNo(o)}</span>
                            <span className="sr-only">{ORDERS[o]!.order}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className="sp-table__none">None</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        ))}
      </table>
    </section>
  );
}
