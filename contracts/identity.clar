;; Identity Contract

(define-constant CONTRACT_OWNER tx-sender)
(define-constant ERR_NOT_AUTHORIZED (err u401))
(define-constant ERR_ALREADY_EXISTS (err u409))
(define-constant ERR_NOT_FOUND (err u404))

(define-map identities
  { id: principal }
  {
    username: (string-ascii 64),
    email: (string-ascii 64),
    created-at: uint
  }
)

(define-public (register-identity (username (string-ascii 64)) (email (string-ascii 64)))
  (let
    ((existing-identity (map-get? identities { id: tx-sender })))
    (asserts! (is-none existing-identity) ERR_ALREADY_EXISTS)
    (ok (map-set identities
      { id: tx-sender }
      {
        username: username,
        email: email,
        created-at: block-height
      }
    ))
  )
)

(define-public (update-identity (username (string-ascii 64)) (email (string-ascii 64)))
  (let
    ((existing-identity (unwrap! (map-get? identities { id: tx-sender }) ERR_NOT_FOUND)))
    (ok (map-set identities
      { id: tx-sender }
      (merge existing-identity
        {
          username: username,
          email: email
        }
      )
    ))
  )
)

(define-read-only (get-identity (id principal))
  (map-get? identities { id: id })
)

