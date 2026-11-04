# 設計上の決定事項

現在の主要な設計判断をまとめる。実装済み機能の一覧ではなく、今後の実装にも適用する方針を含む。
決定の理由や議論の経緯は、各項目の参照先で確認する。

## コンセプト・スコープ

- hpdaysは、Hello! Projectメンバーの在籍日数を中心に、在籍記録やグループの歴史を時間軸から楽しむWebアプリとする。
- `hpdays` は仮称とし、正式名称は別途検討する。
- ファーストリリースは、Xで正式に告知して広く利用してもらうタイミングとする。開発途中のデプロイとは区別する。
- ファーストリリースの対象は、リリース時点で活動しているHello! Projectの全グループと、その歴代メンバーとする。
- 主要機能は、在籍日数ランキング、在籍タイムライン、メンバー詳細とする。
- ランキングは、Hello! Project全体・グループ別、現役・卒業済みの絞り込み、指定日時点の表示、メンバー詳細への遷移を対象とする。
- 「今日の記録」「次に起こる記録」などは、ファーストリリースで一部の導入を検討する。具体的な対象は未確定とする。
- メンバー比較、活動を終了した過去グループへの対応、記録関連機能の拡充はファーストリリース以降に検討する。

参照：[Issue #12の検討結果](https://github.com/djkazunoko/hpdays/issues/12#issuecomment-5652131242)

## データ設計

### 保存する情報

`src/data` 以下のJSONを元データとし、事実だけを保持する。
在籍日数、現役・卒業済み、Hello! Project在籍期間、ランキングなどの導出値は保存せず、TypeScriptで計算する。
新しいデータ項目は、具体的な機能で必要になるまで追加しない。

| ファイル | 保持する情報 |
| --- | --- |
| `members.json` | メンバー自身の情報 |
| `groups.json` | グループの情報 |
| `group-memberships.json` | メンバーとグループの在籍履歴 |
| `trainee-memberships.json` | 研修生歴のあるメンバーのIDと研修生加入日 |

- 研修生のみで活動を終了し、Hello! Projectのグループ・ユニット等でデビューしていない人物は掲載対象としない。
- ファーストリリースの掲載対象は、現役グループに在籍したことがある人とする。サブメンバーも在籍とみなす。
- `groups.json` には現役グループだけを保持する。ユニット、シャッフルユニット、期間限定・企画ユニット、活動を終了した過去グループは保持しない。
- 改名したグループは同じグループとして扱い、現在の名前を使う。
- 研修生歴とグループ在籍からHello! Project加入日・卒業日を導出できない人に限り、その日付を `members.json` に保持する。過去グループの追加などで導出できるようになった場合は削除する。
- ハロプロ研修生、ハロプロエッグ、ハロー！プロジェクト・キッズ、ハロプロ研修生北海道は、同じ「研修生」として扱い、種類を示すデータは保持しない。
- 研修生期間の終了日は、最初のグループ加入日から導出し、JSONには保持しない。過去グループを経由した人や、グループ在籍の後に研修生になった人は正しく導出できないが、研修生期間を使う機能を作る時点で対応する。
- 日付は、日まで確認できる場合は `YYYY-MM-DD`、月までの場合は `YYYY-MM` で保持し、不明な日を補完しない。
- 脱退・活動終了・契約解除は区別せず、卒業と同じく終了日として扱う。終わり方の種類は保持しない。
- ファーストリリースではメンバーカラーを使用しない。
- 期・世代は使用する機能が決まるまで追加しない。必要になった場合、グループの期は `GroupMembership` に保持する。

参照：[Issue #2のデータ構成](https://github.com/djkazunoko/hpdays/issues/2#issuecomment-5595104572)、
[研修生期間の終了日](https://github.com/djkazunoko/hpdays/issues/2#issuecomment-5595313092)、
[Issue #12の検討結果](https://github.com/djkazunoko/hpdays/issues/12#issuecomment-5652131242)、
[Issue #21の決定事項](https://github.com/djkazunoko/hpdays/issues/21#issuecomment-6595817335)

### 在籍期間・日数・順位

- 在籍日数は加入日を1日目として、加入日と終了日の両方を含めて計算する。現役メンバーは現在日を終了日として計算する。
- Hello! Project加入日・卒業日は、`members.json` に保持している場合はその値を使い、保持していない場合は以下のとおり導出する。
- Hello! Project加入日は、研修生加入日と最も古いグループ加入日の早い方とする。
- Hello! Project卒業日は、卒業済みメンバーでは最も遅いグループ卒業日から導出する。現役のグループ在籍があれば現役として扱う。
- Hello! Project在籍期間は、活動休止期間などがあっても連続した期間として扱う。Hello! Projectを離れた後に復帰した場合も、最初の加入日から最後の卒業日まで連続した期間として扱う。
- グループ卒業でHello! Projectを離れた後の活動のうち、Hello! Projectの一員として扱われていないものは在籍期間に含めない。
- 加入日が月までしか分からない場合は、月末を計算上の開始境界として「確認できる最小在籍日数」を求める。実際の加入日を月末と推定するものではなく、元の日付精度は保持する。
- ランキングは在籍日数の降順とし、月単位の加入日は最小在籍日数で比較する。
- Hello! Project・グループの両ランキングで、同日数は同順位とし、次の順位は同順位の人数分を飛ばす（例：1、2、2、4位）。
- 最小在籍日数は「○○日以上」と表示し、確認できる最小値であることが分かるようにする。

参照：[Issue #4の数え方](https://github.com/djkazunoko/hpdays/issues/4#issuecomment-5596338412)、
[Issue #15](https://github.com/djkazunoko/hpdays/issues/15)、
[PR #16](https://github.com/djkazunoko/hpdays/pull/16)、
[Issue #6](https://github.com/djkazunoko/hpdays/issues/6)、
[Issue #21の決定事項](https://github.com/djkazunoko/hpdays/issues/21#issuecomment-6595817335)

## URL設計

主要機能を第1階層に置き、継続して参照・共有する対象をパスで表す。

| パス | 対象 |
| --- | --- |
| `/` | アプリの入口 |
| `/rankings` | Hello! Project全体のランキング |
| `/rankings/:groupId` | 特定グループのランキング |
| `/timelines` | Hello! Project全体の在籍タイムライン |
| `/timelines/:groupId` | 特定グループの在籍タイムライン |
| `/members/:memberId` | メンバー詳細。メンバーIDはJSONのIDを使用する |

- `/` は特定機能の恒久的なURLとして扱わず、ランキングなどには固有のURLを持たせる。
- グループはランキング・タイムラインの対象として扱い、`/groups`・`/groups/:groupId` は作成しない。
- メンバー一覧の `/members` は作成しない。`/members` と存在しないメンバーIDへのアクセスは、存在しないページとして扱う。
- 絞り込み、並び順、選択状態など、共有時に再現する価値のある表示条件はクエリパラメータで表す。具体的な名前・保持する状態は各機能の実装時に決める。
- ズーム倍率、スクロール位置、hover状態など、一時的なUI状態までURLに保持する必要はない。
- メンバー比較など、将来の機能のURLは必要になった時点で決定する。
- 直接アクセスされたURLは、Cloudflare Workersが `index.html` を返し、React Routerで表示する画面を決める。この動作は `wrangler.jsonc` の `not_found_handling: "single-page-application"` で明示的に設定し、存在しないページもReact Routerで表示する。

参照：[Issue #14のURL設計](https://github.com/djkazunoko/hpdays/issues/14#issuecomment-5679652169)、
[PR #22](https://github.com/djkazunoko/hpdays/pull/22)、
[Issue #24の決定事項](https://github.com/djkazunoko/hpdays/issues/24#issuecomment-6621823936)

## 画面設計

- スマートフォンでの閲覧を中心に設計し、PCでもランキング・タイムラインを見やすく表示する。
- メンバーの顔写真などの画像は使用しない。
- 静的HTMLのプロトタイプは画面の役割・情報の優先順位・導線を確認するためのものとする。フォント、色、余白、細かな表示項目や操作方法は実装時に調整する。

| 画面 | 役割・主な導線 |
| --- | --- |
| トップ | アプリの説明、ランキング・タイムラインへの入口。初期はランキング中心でもよく、将来は今日・これからの記録を中心に変更できる構成とする |
| ランキング | 順位・メンバー名・在籍日数を表示し、対象や条件を切り替える。メンバー詳細へ移動できるようにする |
| タイムライン | 在籍期間とその重なりを表示する。メンバーや日付の選択による確認、条件に合うメンバーの強調、メンバー詳細への遷移を扱う |
| メンバー詳細 | 在籍期間・日数など、導出できる在籍記録を中心に表示する。具体的な項目は実装時に調整し、ランキング・タイムラインへの導線を設ける |

各ページにはナビゲーションからも移動できるようにする。
グループ一覧・詳細の独立画面は作成せず、対象グループはランキング・タイムラインで選択する。

参照：[Issue #13の画面設計](https://github.com/djkazunoko/hpdays/issues/13#issuecomment-5676335637)、
[Issue #14のURL設計](https://github.com/djkazunoko/hpdays/issues/14#issuecomment-5679652169)

## 実装方針

### 計算と表示の分離

- 在籍日数、順位などの計算や判定は `src/utils` のTypeScriptで行い、Reactのコンポーネントは結果を表示する。
- 表示の切り替えに必要な判定（例：在籍日数が最小在籍日数か）も計算結果に含め、コンポーネントではデータ設計上のルールを判定しない。表示する文言や形式はコンポーネントで決める。
- ページのコンポーネントは表示するデータをpropsで受け取り、JSONの読み込みと計算処理の呼び出しはルート定義で行う。

### ライブラリ

- ルーティングにはReact Routerを使用する。`/rankings/:groupId` などのパスパラメータや存在しないページの扱いが必要になるため、自前でパスを分岐させない。
- 画面のテストにはTesting Libraryとjsdomを使用し、表示されるテキストや要素の役割で検証する。jsdomは画面のテストファイルだけで指定し、計算処理のテストはNode環境で実行する。

参照：[PR #22](https://github.com/djkazunoko/hpdays/pull/22)

### CI・開発環境

- PRとmainへのpushで、GitHub Actionsによりlint・テスト・ビルドを実行する。Vitestは型チェックを行わないため、型エラーはビルドで検出する。
- Node.jsのバージョンは `.nvmrc` だけで指定し、CIやデプロイ先のビルドからも参照する。LTSのバージョンを使用する。
- mainブランチはRulesetsで保護し、PRのマージにはCIの成功を必須とする。軽微な修正をmainへ直接コミットできるよう、リポジトリ管理者はルールを回避できるようにする。PRの承認やmainへの追従は必須にしない。

参照：[Issue #23](https://github.com/djkazunoko/hpdays/issues/23)、
[PR #27](https://github.com/djkazunoko/hpdays/pull/27)

### デプロイ

- Cloudflare Workers（Static Assets）で、ビルド結果を静的ファイルとして配信する。設定はダッシュボードではなく `wrangler.jsonc` で管理する。
- GitHubとの連携にはWorkers Buildsを使い、mainへのpushで本番環境にデプロイし、PRごとにプレビュー環境を作成する。デプロイはCIの結果を待たずに行われるため、PRのマージにCIの成功を必須とすることで補う。
- 開発中は無料の `workers.dev` のURLで運用する。独自ドメインはファーストリリース時に導入し、正式なアプリ名とあわせて決める。

参照：[Issue #24の決定事項](https://github.com/djkazunoko/hpdays/issues/24#issuecomment-6621823936)、
[PR #28](https://github.com/djkazunoko/hpdays/pull/28)
