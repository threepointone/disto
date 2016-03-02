import { getQuery, Component } from '../src'

const initial = {
  'items': [
    {
      id: 0, type: 'post',
      author: 'Laura Smith',
      title: 'A Post!',
      content: 'Lorem ipsum dolor sit amet, quem atomorum te quo',
      favorites: 0
    }, {
      id: 0, type: 'photo',
      title: 'A Photo!',
      content: 'Lorem ipsum',
      favorites: 0
    },
    {
      id: 2, type: 'post',
      author: "Jim Jacobs",
      title: "Another Post!",
      content: "Lorem ipsum dolor sit amet, quem atomorum te quo",
      favorites: 0
    }, {
      id: 3, type: 'graphic',
      title: "Charts and Stufff!",
      image: "chart.jpg",
      favorites: 0
    }, {
      id: 4, type: 'post',
      author: "May Fields",
      title: "Yet Another Post!",
      content: "Lorem ipsum dolor sit amet, quem atomorum te quo",
      favorites: 0
    }
  ]
}

class Post extends Component {
  static query = () => [ 'id', 'type', 'title', 'author', 'content' ]
}

class Photo extends Component {
  static query = () => [ 'id', 'type', 'title', 'image', 'caption' ]
  render() {
    let { title, image, caption } = this.props
    return <div>
      <h3>Photo {title}</h3>
      <div>{image}</div>
      <p>Caption {caption}</p>
    </div>
  }
}

class Graphic extends Component {
  static query = () => [ 'id', 'type', 'title', 'image' ]
  render() {
    let { title, image } = this.this.props
    return <div>
      <h3>Graphic {title}</h3>
      <div>{image}</div>
    </div>
  }
}

class DashboardItem extends Component {
  static ident = ({ type, id }) => [ type, id ]
  static query = () => zipmap([ 'dashboard/post', 'dashboard/photo', 'dashboard/graphic' ],
    [ getQuery(Post), getQuery(Photo), getQuery(Graphic) ].map(x => [ ...x, 'favorites' ]))
  render() {
    let { id, type, favorites } = this.props
    return <li>
      {do { let el; switch(type) {
        case 'dashboard/'
      }}}
    </li>
  }
}



// (defui DashboardItem
//   static om/Ident
//   (ident [this {:keys [id type]}]
//     [type id])
//   static om/IQuery
//   (query [this]
//     (zipmap
//       [:dashboard/post :dashboard/photo :dashboard/graphic]
//       (map #(conj % :favorites)
//         [(om/get-query Post)
//          (om/get-query Photo)
//          (om/get-query Graphic)])))
//   Object
//   (render [this]
//     (let [{:keys [id type favorites] :as props} (om/props this)]
//       (dom/li
//         #js {:style #js {:padding 10 :borderBottom "1px solid black"}}
//         (dom/div nil
//           (({:dashboard/post    post
//              :dashboard/photo   photo
//              :dashboard/graphic graphic} type)
//             (om/props this)))
//         (dom/div nil
//           (dom/p nil (str "Favorites: " favorites))
//           (dom/button
//             #js {:onClick
//                  (fn [e]
//                    (om/transact! this
//                      `[(dashboard/favorite {:ref [~type ~id]})]))}
//             "Favorite!"))))))

// (def dashboard-item (om/factory DashboardItem))

// (defui Dashboard
//   static om/IQuery
//   (query [this]
//     [{:dashboard/items (om/get-query DashboardItem)}])
//   Object
//   (render [this]
//     (let [{:keys [dashboard/items]} (om/props this)]
//       (apply dom/ul
//         #js {:style #js {:padding 0}}
//         (map dashboard-item items)))))

// (defmulti read om/dispatch)

// (defmethod read :dashboard/items
//   [{:keys [state]} k _]
//   (let [st @state]
//     {:value (into [] (map #(get-in st %)) (get st k))}))

// (defmulti mutate om/dispatch)

// (defmethod mutate 'dashboard/favorite
//   [{:keys [state]} k {:keys [ref]}]
//   {:action
//    (fn []
//      (swap! state update-in (conj ref :favorites) inc))})

// (def reconciler
//   (om/reconciler
//     {:state  init-data
//      :parser (om/parser {:read read :mutate mutate})}))

// (om/add-root! reconciler Dashboard (gdom/getElement "app"))