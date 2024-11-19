use std::{error::Error, fmt::Display, str::FromStr};

#[derive(Debug)]
pub enum KubeconfigKeyError {
    KeyLengthError,
}

#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub struct KubeconfigKey(pub String, pub String);

impl Display for KubeconfigKey {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}:{}", self.0, self.1)
    }
}

impl FromStr for KubeconfigKey {
    type Err = KubeconfigKeyError;

    fn from_str(s: &str) -> Result<Self, KubeconfigKeyError> {
        let split = s.split(":").collect::<Vec<&str>>();

        let part1 = split.first().ok_or(KubeconfigKeyError::KeyLengthError)?;
        let part2 = split.get(1).ok_or(KubeconfigKeyError::KeyLengthError)?;

        Ok(Self(part1.to_string(), part2.to_string()))
    }
}

impl Display for KubeconfigKeyError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            KubeconfigKeyError::KeyLengthError => write!(f, "Key length is invalid"),
        }
    }
}

impl Error for KubeconfigKeyError {}
